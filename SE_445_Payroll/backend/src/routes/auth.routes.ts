import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
      return;
    }

    const token = 'dummy_jwt_token_for_mvp';
    res.status(200).json({ 
      success: true, 
      data: { token, user: { id: user.id, email: user.email, role: user.role } } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đăng nhập' });
  }
});

export default router;
