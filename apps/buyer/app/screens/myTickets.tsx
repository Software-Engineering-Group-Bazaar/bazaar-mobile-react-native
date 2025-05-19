// app/myTickets.tsx (ili gde god je smešten)
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform, // Dodato za stilove dugmeta
} from 'react-native';
import { useRouter } from 'expo-router';
import { t } from 'i18next';
import { baseURL, USE_DUMMY_DATA } from 'proba-package'; // Uvezeno
import * as SecureStore from 'expo-secure-store'; // Uvezeno

export interface Ticket {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  resolvedAt?: string | null;
  userId: string;
  userUsername: string;
  assignedAdminId?: string | null;
  adminUsername?: string | null;
  conversationId: number;
  orderId?: number | null;
  status: string;
  isResolved: boolean;
}

const PAGE_SIZE = 10;

// --- DUMMY DATA ---
const dummyTickets: Ticket[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Dummy Ticket ${i + 1} - Problem sa isporukom`,
  description: `Opis problema za tiket ${i + 1}. Molim vas proverite status moje narudžbine #${1000 + i}. Hvala!`,
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Pre i dana
  resolvedAt: i % 3 === 0 ? new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000).toISOString() : null,
  userId: `user_${i + 1}`,
  userUsername: `Korisnik${i + 1}`,
  assignedAdminId: i % 2 === 0 ? `admin_${i % 5}` : null,
  adminUsername: i % 2 === 0 ? `Admin${i % 5}` : undefined,
  conversationId: 100 + i,
  orderId: 1000 + i,
  status: i % 3 === 0 ? 'Resolved' : (i % 2 === 0 ? 'Pending' : 'Open'),
  isResolved: i % 3 === 0,
}));
// --- END DUMMY DATA ---


export default function MyTicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTickets = useCallback(async (page: number, refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    // --- DUMMY DATA LOGIC ---
    if (USE_DUMMY_DATA) {
      console.log(`Fetching DUMMY tickets, page: ${page}`);
      setTimeout(() => {
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const newTickets = dummyTickets.slice(start, end);

        setTickets(prev => (page === 1 ? newTickets : [...prev, ...newTickets]));
        setHasMore(end < dummyTickets.length);

        if (refreshing) setIsRefreshing(false);
        else if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }, 1000);
      return;
    }
    // --- END DUMMY DATA LOGIC ---

    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        setError(t('auth_token_missing', 'Authentication token not found. Please log in.'));
        // Možda preusmeriti na login ekran:
        // router.replace('/login'); // Prilagodite putanju
        throw new Error('Auth token missing');
      }

      const response = await fetch(
        `${baseURL}/api/Tickets?pageNumber=${page}&pageSize=${PAGE_SIZE}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json', // Iako je GET, dobra praksa
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tickets' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newTickets: Ticket[] = await response.json();

      setTickets(prevTickets => (page === 1 ? newTickets : [...prevTickets, ...newTickets]));
      setHasMore(newTickets.length === PAGE_SIZE);
      if (page > 1 && newTickets.length === 0) {
          setHasMore(false);
      }

    } catch (e: any) {
      console.error("Failed to fetch tickets:", e);
      const errorMessage = e.message === 'Auth token missing'
        ? t('auth_token_missing', 'Authentication token not found. Please log in.')
        : e.message || t('tickets_fetch_error', 'Could not load tickets. Please try again.');
      setError(errorMessage);
      setHasMore(false);
    } finally {
      if (refreshing) setIsRefreshing(false);
      else if (page === 1) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isRefreshing && !USE_DUMMY_DATA) { // Onemogući za dummy ako već sve učita odjednom
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchTickets(nextPage);
    } else if (USE_DUMMY_DATA && hasMore && !isLoadingMore) { // Paginacija za dummy data
        const nextPage = pageNumber + 1;
        setPageNumber(nextPage);
        fetchTickets(nextPage);
    }
  };

  const onRefresh = useCallback(() => {
    setPageNumber(1);
    setHasMore(true);
    fetchTickets(1, true);
  }, [fetchTickets]);

  const handleOpenChat = (item : Ticket) => {
    // Pretpostavljena ruta za chat, prilagodite je vašoj strukturi
    // Može biti npr. `/chat/${conversationId}` ili `/tickets/chat/${conversationId}`
    // Ako koristite fajl-sistem rute, npr. app/chat/[conversationId].tsx
    // ili app/tickets/chat/[conversationId].tsx

    router.push({
        pathname: `(tabs)/chat/${item.conversationId}` as any, // Dynamic route using conversation ID
        params: {
          otherUserUsername: item.adminUsername,
          otherUserId: item.assignedAdminId,
          buyerUserId: item.userId,
          buyerUsername: item.userUsername,
          ticketId: item.id,
          //otherUserAvatar: item.otherUserAvatar || DEFAULT_AVATAR,
          // MOCK_CURRENT_USER_ID is handled within ChatScreen's self-contained logic
        },
      });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return dateString; }
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <View style={styles.ticketItem}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>{item.title || t('untitled_ticket', 'Untitled Ticket')}</Text>
        <Text style={[
            styles.ticketStatus,
            item.status.toLowerCase() === 'resolved' || item.isResolved ? styles.statusResolved :
            item.status.toLowerCase() === 'open' ? styles.statusOpen :
            item.status.toLowerCase() === 'pending' ? styles.statusPending : styles.statusOther
          ]}
        >
          {t(`ticket_status_${item.status?.toLowerCase()}`, item.status || 'Unknown')}
        </Text>
      </View>
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description || t('no_description', 'No description provided.')}
      </Text>
      <View style={styles.ticketFooter}>
        <Text style={styles.ticketDate}>
          {t('created_at', 'Created')}: {formatDate(item.createdAt)}
        </Text>
        {item.orderId !== null && item.orderId !== undefined && <Text style={styles.ticketOrderId}>{t('order_id', 'Order ID')}: {item.orderId}</Text>}
      </View>
      <TouchableOpacity
        style={styles.chatButton} // Koristi stil prilagođenog dugmeta
        onPress={() => handleOpenChat(item)}
      >
        <Text style={styles.chatButtonText}>{t('open_chat_button', 'Open Chat')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && pageNumber === 1 && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
        <Text style={{ marginTop: 10, color: '#555' }}>{t('loading_tickets', 'Loading tickets...')}</Text>
      </View>
    );
  }

  if (error && tickets.length === 0) { // Prikazuje grešku samo ako nema tiketa
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        {!USE_DUMMY_DATA && ( // Ne prikazuj retry dugme za dummy data jer bi trebalo da radi
             <TouchableOpacity onPress={() => fetchTickets(1)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>{t('retry_button', 'Try Again')}</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return <ActivityIndicator size="small" color="#4e8d7c" style={{ marginVertical: 20 }} />;
          }
          if (!hasMore && tickets.length > 0) {
            return <Text style={styles.noMoreTicketsText}>{t('no_more_tickets', 'No more tickets to load.')}</Text>;
          }
          return null;
        }}
        ListEmptyComponent={() => (
          !isLoading && !isRefreshing && tickets.length === 0 && !error ? (
            <View style={styles.centered}>
              <Text style={{ color: '#555' }}>{t('no_tickets_found', 'You have no support tickets yet.')}</Text>
            </View>
          ) : null
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#4e8d7c"]}
            tintColor={"#4e8d7c"}
          />
        }
        contentContainerStyle={tickets.length === 0 ? styles.emptyListContainer : {paddingBottom: 20}}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // Malo svetlija pozadina
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: { // Prilagođeno dugme
    backgroundColor: '#4e8d7c', // Usklađena boja
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  ticketItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Shadow (suptilniji)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: '600', // Malo jači font
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12, // Više zaobljeno
    overflow: 'hidden',
    color: 'white',
    textAlign: 'center', // Za bolji izgled teksta unutar taga
    minWidth: 70, // Minimalna širina za status tag
  },
  statusOpen:    { backgroundColor: '#ff9800' }, // Narandžasta
  statusPending: { backgroundColor: '#2196f3' }, // Plava
  statusResolved:{ backgroundColor: '#4caf50' }, // Zelena
  statusOther:   { backgroundColor: '#9e9e9e' }, // Siva za ostale/nepoznate statuse
  ticketDescription: {
    fontSize: 14,
    color: '#555', // Tamnija siva za bolji kontrast
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  ticketDate: {
    fontSize: 12,
    color: '#777',
  },
  ticketOrderId: {
    fontSize: 12,
    color: '#777',
    // marginLeft: 10, // Ako je pored datuma, inače nije potrebno ako je space-between
  },
  chatButton: { // Prilagođeno dugme
    backgroundColor: '#4e8d7c', // Usklađena boja
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5, // Mali razmak od footera ako su blizu
  },
  chatButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  noMoreTicketsText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#888',
  }
});