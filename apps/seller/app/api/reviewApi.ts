import api from "./defaultApi";
import { Review, SellerResponse, SubmitResponsePayload } from "../types/review";

// Tip backend odgovora
interface BackendReviewResponse {
  review: {
    id: number;
    buyerUsername: string;
    storeId: number;
    orderId: number;
    rating: number;
    comment: string;
    dateTime: string;
    isApproved: boolean;
  };
  response?: {
    id: number;
    reviewId: number;
    response: string;
    dateTime: string;
  };
}

// Konverzija u frontend-friendly tip
function mapBackendToReview(entry: BackendReviewResponse): Review {
  return {
    id: entry.review.id.toString(),
    storeId: entry.review.storeId,
    orderId: entry.review.orderId, // ✅ dodano!
    buyer: {
      id: entry.review.buyerUsername,
      name: entry.review.buyerUsername,
    },
    rating: entry.review.rating,
    comment: entry.review.comment,
    createdAt: entry.review.dateTime,
    sellerResponse: entry.response
      ? {
          id: entry.response.id.toString(),
          text: entry.response.response,
          createdAt: entry.response.dateTime,
        }
      : undefined,
  };
}

// FETCH za sve reviewe iz jedne prodavnice
export async function apiFetchStoreReviews(storeId: number): Promise<Review[]> {
  try {
    const response = await api.get(`/Review/store/${storeId}`);
    return response.data.map(mapBackendToReview);
  } catch (error: any) {
    console.error("Error fetching store reviews:", error.response?.data || error.message);
    return [];
  }
}

// SUBMIT odgovora prodavca
export async function apiSubmitSellerResponse(payload: SubmitResponsePayload): Promise<Review | null> {
  const { reviewId, orderId, responseText } = payload;
  try {
    await api.post(`/Review/response`, {
      reviewId: Number(reviewId),
      response: responseText,
    });

    // Umesto reviewId koristi orderId:
    const response = await api.get(`/Review/order/${orderId}`);
    return mapBackendToReview(response.data);
  } catch (error: any) {
    console.error("Error submitting response:", error.response?.data || error.message);
    return null;
  }
}
