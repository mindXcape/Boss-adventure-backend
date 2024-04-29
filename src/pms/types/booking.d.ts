export interface CreateVehicleBooking {
  date: Date;
  vehicleId: string;
  driverId: string;
  date: string;
}

export interface CreateBooking {
  groupId: string;
  date: Date;
  hotelId?: string;
  lodgeId?: string;
  meal: string;
}
