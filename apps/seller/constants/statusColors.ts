// statusColors.ts
import { OrderStatusEnum } from './statusTypes';  

export const STATUS_COLORS: Record<typeof OrderStatusEnum[number], string> = {
    Requested: "#D4A373",
    Confirmed: "#A8DADC",
    Ready: "#A5A58D",
    Sent: "#B07BAC",
    Delivered: "#81B29A",
    Rejected: "#D94F4F",
    Cancelled: "#B4B4B4",
};
