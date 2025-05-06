import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { STATUS_COLORS } from '../../constants/statusColors';
import { OrderStatusEnum } from '../../constants/statusTypes';

type OrderStatus = (typeof OrderStatusEnum)[number];

interface StatusFilterProps {
  selectedStatuses: OrderStatus[];
  toggleStatus: (status: OrderStatus) => void;
  sortNewestFirst: boolean;
  setSortNewestFirst: (value: boolean) => void;
  setSelectedStatuses: (statuses: OrderStatus[]) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  toggleStatus,
  sortNewestFirst,
  setSortNewestFirst,
  setSelectedStatuses,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
      >
        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            selectedStatuses.length === 0 && styles.statusFilterButtonActive,
          ]}
          onPress={() => setSelectedStatuses([])}
        >
          <Text style={styles.statusFilterText}>{t('All')}</Text>
        </TouchableOpacity>

        {OrderStatusEnum.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              selectedStatuses.includes(status) && styles.statusFilterButtonActive,
              { borderColor: STATUS_COLORS[status] },
            ]}
            onPress={() => toggleStatus(status)}
          >
            <Text style={styles.statusFilterText}>{t(status)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.sortToggleButton}
        onPress={() => setSortNewestFirst(!sortNewestFirst)}
      >
        <FontAwesome
          name={sortNewestFirst ? "sort-amount-desc" : "sort-amount-asc"}
          size={16}
          color="#4E8D7C"
        />
        <Text style={styles.sortToggleText}>
          {sortNewestFirst ? t("Newest First") : t("Oldest First")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterWrapper: {
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statusFilterContainer: {
    flexDirection: 'row',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  statusFilterButtonActive: {
    backgroundColor: '#4E8D7C',
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4E8D7C",
    backgroundColor: "#FFFFFF",
  },
  sortToggleText: {
    marginLeft: 6,
    color: "#4E8D7C",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default StatusFilter;
