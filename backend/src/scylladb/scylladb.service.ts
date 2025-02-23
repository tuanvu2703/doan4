import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class ScylladbService {
  constructor(@Inject('SCYLLA_CLIENT') private readonly scyllaClient: Client) {
    console.log('🔍 ScyllaDB Client:', this.scyllaClient);
  }

  async checkConnection() {
    try {
      const query = 'SELECT release_version FROM system.local';
      const result = await this.scyllaClient.execute(query);
      console.log('✅ ScyllaDB Connected! Version:', result.rows[0].release_version);
      return result.rows[0];
    } catch (error) {
      console.error('❌ ScyllaDB Connection Failed:', error);
      throw error;
    }
  }
}
