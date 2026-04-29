import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kart-system-dev-secret-change-in-production';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

export async function login(req, res) {
  try {
    const rawUser = req.body?.username;
    const rawPass = req.body?.password;
    const username = typeof rawUser === 'string' ? rawUser.trim() : '';
    const password = typeof rawPass === 'string' ? rawPass : '';
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
    }
    const token = jwt.sign({ role: 'admin', sub: ADMIN_USERNAME }, JWT_SECRET, {
      expiresIn: '12h'
    });
    res.json({ token, username: ADMIN_USERNAME });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao autenticar' });
  }
}
