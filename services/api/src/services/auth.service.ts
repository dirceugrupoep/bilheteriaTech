/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description Service com lógica de negócio para autenticação do sistema de bilheteria.
 */
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository.js';
import { RegisterInput, LoginInput, AuthResponseDTO } from '../dtos/auth.dto.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../config/logger.js';

export class AuthService {
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async register(data: RegisterInput): Promise<AuthResponseDTO> {
    try {
      // Verificar se usuário já existe
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Criar usuário
      const user = await this.userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'USER',
      });

      // Gerar token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('Erro ao registrar usuário:', error);
      if (error instanceof Error && error.message === 'Email já cadastrado') {
        throw error;
      }
      throw new Error('Erro ao criar usuário');
    }
  }

  async login(data: LoginInput, isAdmin = false): Promise<AuthResponseDTO> {
    try {
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      // Verificar se é admin (se necessário)
      if (isAdmin && user.role !== 'ADMIN') {
        throw new Error('Credenciais inválidas');
      }

      // Verificar senha
      const isValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValid) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar token
      const token = generateToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        isAdmin
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('Erro ao fazer login:', error);
      if (error instanceof Error && error.message === 'Credenciais inválidas') {
        throw error;
      }
      throw new Error('Erro ao fazer login');
    }
  }
}
