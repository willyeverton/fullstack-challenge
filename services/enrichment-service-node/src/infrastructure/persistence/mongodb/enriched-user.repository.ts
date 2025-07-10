import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEnrichedUserRepository } from '../../../domain/repositories/enriched-user.repository.interface';
import { EnrichedUser, EnrichedUserDocument } from '../../../domain/entities/enriched-user.entity';

@Injectable()
export class MongoEnrichedUserRepository implements IEnrichedUserRepository {
  constructor(
    @InjectModel(EnrichedUser.name)
    private enrichedUserModel: Model<EnrichedUserDocument>,
  ) {}

  async findByUuid(uuid: string): Promise<EnrichedUser | null> {
    const user = await this.enrichedUserModel.findOne({ uuid }).exec();
    return user ? new EnrichedUser(user.toJSON()) : null;
  }

  async save(user: EnrichedUser): Promise<EnrichedUser> {
    const createdUser = new this.enrichedUserModel(user);
    const savedUser = await createdUser.save();
    return new EnrichedUser(savedUser.toJSON());
  }

  async update(uuid: string, user: Partial<EnrichedUser>): Promise<EnrichedUser | null> {
    const updatedUser = await this.enrichedUserModel
      .findOneAndUpdate({ uuid }, user, { new: true })
      .exec();
    return updatedUser ? new EnrichedUser(updatedUser.toJSON()) : null;
  }

  async findAll(): Promise<EnrichedUser[]> {
    const users = await this.enrichedUserModel.find().exec();
    return users.map(user => new EnrichedUser(user.toJSON()));
  }

  async findPending(): Promise<EnrichedUser[]> {
    const users = await this.enrichedUserModel
      .find({ status: 'pending' })
      .exec();
    return users.map(user => new EnrichedUser(user.toJSON()));
  }
} 