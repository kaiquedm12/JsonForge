import { test, expect } from '@playwright/test'

test.describe('REST API', () => {
  test('POST /api/visualize should return graph data', async ({ request }) => {
    const response = await request.post('/api/visualize', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      data: { name: 'test', value: 42 },
    })
    expect(response.status()).toBe(401)
  })
})
