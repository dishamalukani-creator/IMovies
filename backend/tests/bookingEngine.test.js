import { calculateBookingPrice } from '../src/services/booking.service.js';
import { generateSeatLayout } from '../src/services/show.service.js';

describe('Booking & Seat Allocation Engine', () => {
  describe('calculateBookingPrice', () => {
    it('should calculate subtotal, convenience fee (8%), and tax (18%) accurately on the server', () => {
      const mockShow = {
        pricing: [
          { category: 'Platinum', price: 400 },
          { category: 'Gold', price: 250 },
          { category: 'Silver', price: 150 },
        ],
      };

      const selectedSeats = [
        { seatId: 'A1', row: 'A', number: 1, category: 'Platinum' },
        { seatId: 'A2', row: 'A', number: 2, category: 'Platinum' },
        { seatId: 'C5', row: 'C', number: 5, category: 'Gold' },
      ];

      // Subtotal = 400 + 400 + 250 = 1050
      // Fee = round(1050 * 0.08) = 84
      // Tax = round((1050 + 84) * 0.18) = round(1134 * 0.18) = 204
      // Total = 1050 + 84 + 204 = 1338
      const result = calculateBookingPrice(mockShow, selectedSeats);

      expect(result.subtotal).toBe(1050);
      expect(result.convenienceFee).toBe(84);
      expect(result.tax).toBe(204);
      expect(result.totalAmount).toBe(1338);
      expect(result.detailedSeats.length).toBe(3);
      expect(result.detailedSeats[0].price).toBe(400);
      expect(result.detailedSeats[2].price).toBe(250);
    });

    it('should fallback to standard pricing if category is not explicitly in show pricing', () => {
      const mockShow = {
        pricing: [],
      };

      const selectedSeats = [
        { seatId: 'B1', row: 'B', number: 1, category: 'Standard' },
      ];

      const result = calculateBookingPrice(mockShow, selectedSeats);
      expect(result.subtotal).toBe(200); // default 200
      expect(result.totalAmount).toBeGreaterThan(result.subtotal);
    });
  });

  describe('generateSeatLayout', () => {
    it('should generate full seat grid matching screen rows, columns, and categories', () => {
      const mockScreen = {
        screenNumber: 1,
        name: 'Screen 1',
        seatingLayout: {
          rows: ['A', 'B', 'C'],
          columnsPerRow: 6,
          aisles: [3],
          seatCategories: [
            { category: 'Platinum', rows: ['A'], basePrice: 300 },
            { category: 'Gold', rows: ['B', 'C'], basePrice: 200 },
          ],
        },
      };

      const seats = generateSeatLayout(mockScreen);
      // 3 rows * 6 cols = 18 seats
      expect(seats.length).toBe(18);

      const a1 = seats.find((s) => s.seatId === 'A1');
      expect(a1).toBeDefined();
      expect(a1.category).toBe('Platinum');
      expect(a1.status).toBe('available');
      expect(a1.row).toBe('A');
      expect(a1.number).toBe(1);

      const b3 = seats.find((s) => s.seatId === 'B3');
      expect(b3).toBeDefined();
      expect(b3.category).toBe('Gold');
    });
  });
});
