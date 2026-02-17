/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2026-02-17
 * @description Service com lógica de negócio para usuários do sistema de bilheteria.
 */
import { UserRepository } from '../repositories/user.repository.js';
import { logger } from '../config/logger.js';

export class UserService {
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async getAllUsers() {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      throw new Error('Erro ao listar usuários');
    }
  }
}
