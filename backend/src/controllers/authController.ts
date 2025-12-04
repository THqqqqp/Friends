import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { verifyPassword } from "../utils/password";

export async function login(req: Request, res: Response, next: NextFunction) {
  console.log("[auth/login] ENV account:", env.adminAccount);
  try {
    const { account, password } = req.body;
    if (!account || !password) {
      return res.status(400).json({ message: "请输入账号与密码" });
    }
    if (account !== env.adminAccount) {
      return res.status(401).json({ message: "账号不存在" });
    }
    const plainMatch = env.adminPassword && password === env.adminPassword;
    const hashMatch = plainMatch
      ? true
      : await verifyPassword(password, env.adminPasswordHash);
    if (!plainMatch && !hashMatch) {
      return res.status(401).json({ message: "密码错误" });
    }
    const token = jwt.sign({ sub: env.adminAccount }, env.jwtSecret, {
      expiresIn: "8h",
    });
    res.json({
      token,
      expiresIn: 8 * 60 * 60,
    });
  } catch (error) {
    next(error);
  }
}
