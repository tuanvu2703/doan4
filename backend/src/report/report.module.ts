import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from './schema/report.schema';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';
import { ProducerModule } from 'src/kafka/producer/producer.module';
import { PostModule } from '../post/post.module';
import { AppealSchema } from './schema/appeal.schema';

@Module({
    imports: [
        UserModule,
        EventModule,
        ProducerModule,
        PostModule,
        MongooseModule.forFeature([{ name: 'Report', schema: ReportSchema}]),
        MongooseModule.forFeature([{ name: 'Appeal', schema: AppealSchema}]),

    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [MongooseModule, ReportService]
})
export class ReportModule {}
