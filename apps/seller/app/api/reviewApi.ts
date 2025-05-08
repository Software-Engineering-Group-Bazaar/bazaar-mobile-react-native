// apps/seller/app/api/reviewApi.ts
import api from "./defaultApi";
import { Review, SubmitResponsePayload } from "../types/review"; // Prilagodi putanju ako je review.ts negde drugde

const MOCK_REVIEWS_FROM_BUYERS: Review[] = [
  {
    id: "review-001", // Jedinstveni ID za review
    storeId: 1,       // ID prodavnice za koju je review (prilagodi ako je potrebno)
    buyer: { id: "buyer-abc", name: "Marko Marković" },
    rating: 5,
    comment: "Sjajna prodavnica! Brza isporuka i kvalitetni proizvodi. Preporučujem!",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Pre 3 dana
    sellerResponse: { 
      id: "response-xyz", 
      text: "Hvala Vam puno na divnim rečima, Marko! Radujemo se budućoj saradnji.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    },
  },
  {
    id: "review-002",
    storeId: 1,
    buyer: { id: "buyer-def", name: "Jovana Jovanović" },
    rating: 4,
    comment: "Zadovoljna sam kupovinom. Proizvod odgovara opisu.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: "review-003",
    storeId: 1,
    buyer: { id: "buyer-ghi", name: "Stefan Stević" },
    rating: 2,
    comment: "Malo sam razočaran, očekivao sam više. Pakovanje je bilo oštećeno.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    
  },
];


let mockLocalReviewDatabase = JSON.parse(JSON.stringify(MOCK_REVIEWS_FROM_BUYERS));


// API FUNKCIJE

export async function apiFetchStoreReviews(storeId: number): Promise<Review[]> {
  console.log(`[MOCK] Fetching reviews for store ID: ${storeId}`);

  await new Promise(resolve => setTimeout(resolve, 700));
  // Filtriramo review-e iz naše "lokalne mock baze" za dati storeId
  const storeReviews = mockLocalReviewDatabase.filter((review: Review) => review.storeId === storeId);
  console.log(`[MOCK] Found ${storeReviews.length} reviews for store ${storeId}.`);
  return storeReviews;

  /*
  // --- PRAVA IMPLEMENTACIJA  ---
  try {
   const response = await api.get(`/api/stores/${storeId}/reviews`);
    const response = await api.get(`/reviews?storeId=${storeId}`); // Prilagodi rutu
  return response.data as Review[];
  } catch (error: any) {
    console.error(`Error fetching reviews for store ${storeId}:`, error.response?.data || error.message);
    return [];
  }
  */
}


export async function apiSubmitSellerResponse(payload: SubmitResponsePayload): Promise<Review | null> {
  const { reviewId, responseText } = payload;
  console.log(`[MOCK] Submitting response for review ID: ${reviewId}, Text: "${responseText}"`);


  await new Promise(resolve => setTimeout(resolve, 1200));

  const reviewIndex = mockLocalReviewDatabase.findIndex((r: Review) => r.id === reviewId);

  if (reviewIndex !== -1) {
    const existingResponseId = mockLocalReviewDatabase[reviewIndex].sellerResponse?.id;
    mockLocalReviewDatabase[reviewIndex].sellerResponse = {
      id: existingResponseId || `mock-resp-${Date.now()}`, 
      text: responseText,
      createdAt: new Date().toISOString(),
    };
    console.log("[MOCK] Seller response added/updated in mock database:", mockLocalReviewDatabase[reviewIndex]);
    return mockLocalReviewDatabase[reviewIndex]; // Vraćamo ažurirani review
  } else {
    console.warn(`[MOCK] Review with ID ${reviewId} not found in mock database.`);
    return null; // Review nije pronađen
  }
 
  /*
  // --- PRAVA IMPLEMENTACIJA (kada backend bude spreman) ---
  try {
  const response = await api.post(`/api/reviews/${reviewId}/responses`, { text: responseText });
 const response = await api.post(`/reviews/${reviewId}/respond`, { text: responseText }); 
    return response.data as Review; // Backend bi trebalo da vrati ažurirani review
  } catch (error: any) {
    console.error(`Error submitting response for review ${reviewId}:`, error.response?.data || error.message);
    return null;
  }
  */
}