import assert from 'assert';
import { Buffer } from 'buffer';
import { ClientConfigBuilder } from '../../integration-test.config';
import { ClientConfig } from '../../../core/client-config.model';
import { CoreAPIClient } from '../../../core-api.client';
import ServiceCallTreeFixture from '../service-management/service-call-tree.fixture.json';

describe('AttachmentsAPI', () => {

  const config = { ...ClientConfigBuilder.getConfig('password'), tokenCacheFilePath: undefined, debug: false } as ClientConfig;
  const client = new CoreAPIClient(config);

  const setup = async (): Promise<{ attachmentId: string, cleanup: () => Promise<void> }> => {
    const [{ businessPartner }] = await client
      .dataServiceAPI
      .query(`select businessPartner FROM BusinessPartner businessPartner LIMIT 1`, ['BusinessPartner'])
      .then(r => r.data);

    const serviceCall = await client.serviceManagementAPI.composite.tree.postServiceCall({
      ...ServiceCallTreeFixture,
      id: CoreAPIClient.createUUID(),
      subject: `test-attachment-setup-${Date.now()}`,
      businessPartner: { id: businessPartner?.id || '' },
    }, { autoCreateActivity: true });

    const activityId = serviceCall.activities![0].id!;

    const id = CoreAPIClient.createUUID({ legacyFormat: true });
    const [{ attachment }] = await client.dataServiceAPI.post('Attachment', {
      id,
      fileName: `test-attachment-${Date.now()}.txt`,
      title: `Test Attachment ${Date.now()}`,
      fileContent: Buffer.from(`This is a test attachment created at ${new Date().toISOString()}`).toString('base64'),
      object: {
        objectType: 'ACTIVITY',
        objectId: activityId,

      }
    }).then(r => r.data);

    const cleanup = async () => {
      try {
        await client.dataServiceAPI.deleteById('Attachment', attachment as any);
      } catch (e) {
        // ignore
      }
    };

    return { attachmentId: attachment.id!, cleanup };
  };

  it('HEAD - checkExists', async () => {
    const { attachmentId, cleanup } = await setup();
    try {
      const result = await client.attachmentAPI.checkExists(attachmentId);
      assert(result !== undefined, 'should return a result');
    } finally {
      await cleanup();
    }
  }).timeout(ClientConfigBuilder.getTestTimeout());

  it('GET - downloadContent', async () => {
    const { attachmentId, cleanup } = await setup();
    try {
      const result = await client.attachmentAPI.downloadContent(attachmentId);
      assert(result !== undefined, 'should return content');
    } finally {
      await cleanup();
    }
  }).timeout(ClientConfigBuilder.getTestTimeout());

  xit('DELETE - deleteContent', async () => {
    const { attachmentId, cleanup } = await setup();
    try {
      const result = await client.attachmentAPI.deleteContent(attachmentId);
      assert(result === '' || result === null, 'should return empty on delete');
    } finally {
      await cleanup();
    }
  }).timeout(ClientConfigBuilder.getTestTimeout());

});
