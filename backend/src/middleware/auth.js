import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kart-system-dev-secret-change-in-production';

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Autenticação necessária para esta operação' });
  }
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }
}
