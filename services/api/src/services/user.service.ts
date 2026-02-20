/**
 * @project BilheteriaTech
 * @author Dirceu Silva de Oliveira Tech
 * @date 2025-02-15
 * @description Serviço de usuários para lógica de negócio
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
