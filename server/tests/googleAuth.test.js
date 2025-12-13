const jwt = require('jsonwebtoken');

// Force test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

describe('Google Authentication - JWT Token Generation', () => {
  test('JWT token should be generated and verified correctly', () => {
    const userId = '676fe0f00000000000000001';
    const email = 'google.user@example.com';
    const role = 'Employee';

    // Generate JWT token (same logic as in authRoutes.js callback)
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Verify token can be decoded
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');

    // Verify token contents
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ id: userId, email, role });
    expect(decoded.iat).toBeDefined(); // issued at
    expect(decoded.exp).toBeDefined(); // expiration
  });

  test('Invalid JWT token should throw verification error', () => {
    const invalidToken = 'invalid.token.here';

    expect(() => {
      jwt.verify(invalidToken, process.env.JWT_SECRET);
    }).toThrow();
  });

  test('Token signed with different secret should fail verification', () => {
    const token = jwt.sign({ id: '123', email: 'test@test.com' }, 'secret1', { expiresIn: '7d' });

    expect(() => {
      jwt.verify(token, 'secret2');
    }).toThrow();
  });
});
