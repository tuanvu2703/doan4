import { Module, Global } from '@nestjs/common';
import { ScylladbController } from './scylladb.controller';
import { ScylladbService } from './scylladb.service';
import * as cassandra from 'cassandra-driver';

@Global()
@Module({
  controllers: [ScylladbController],
  providers: [
    {
      provide: 'SCYLLA_CLIENT',
      useFactory: async () => {
        const client = new cassandra.Client({
          contactPoints: [
            process.env.SCYLLADB_URI_1,
            process.env.SCYLLADB_URI_2,
            process.env.SCYLLADB_URI_3,
          ],
          localDataCenter: process.env.DATACENTER_SCYLLA,
          credentials: {
            username: process.env.USERNAME_SCYLLA,
            password: process.env.PASSWORD_SCYLLA,
          },
        });
        
        await client.connect();
        console.log('✅ Connected to ScyllaDB Cloud');
        return client;
      },
    },
    ScylladbService,
  ],
  exports: ['SCYLLA_CLIENT', ScylladbService],
})
export class ScylladbModule {}
