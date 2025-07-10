import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfig } from './config/configuration';
import { validate } from './config/environment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService) => ({
        uri: configService.get('app.mongodb.uri'),
      }),
      inject: ['app.mongodb'],
    }),
    // Outros módulos serão importados aqui
  ],
})
export class AppModule {}
