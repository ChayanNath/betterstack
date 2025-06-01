import { describe, it, expect } from 'bun:test';
import axios from 'axios';

let BASE_URL = 'http://localhost:3000';

describe('Website', () => {
    it('should create a website', async () => {
        const response = await axios.post(`${BASE_URL}/api/v1/website`, {
            url: 'https://www.google.com',
        });
        expect(response.status).toBe(201);
        expect(response.data.id).toBeTruthy();
        expect(response.data.message).toBe('Website created successfully');
    });

    it("if url is not provided, should return 400", async () => {
      try {
        await axios.post(`${BASE_URL}/api/v1/website`, {});
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toMatch(/url.*required/i);
        } else {
          throw error;
        }
      }
    });
});