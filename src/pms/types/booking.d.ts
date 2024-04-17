export interface CreateBooking {
  groupId: string;
  date: Date;
  hotelId?: string;
  lodgeId?: string;
  meal: string;
}
