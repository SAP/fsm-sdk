import assert from 'assert';
import { ClientConfigBuilder } from '../../integration-test.config';
import { ClientConfig } from '../../../core/client-config.model';
import { LabelTranslationDto, ValueTranslationDataDto, ValueTranslationDto } from '../../../core/translations/translations.model';
import { CoreAPIClient } from '../../../core-api.client';

describe('TranslationAPI', () => {

  const config = { ...ClientConfigBuilder.getConfig('password'), tokenCacheFilePath: undefined, debug: false } as ClientConfig
  const client = new CoreAPIClient(config);

  describe('Lables', () => {
    const THE_ID = CoreAPIClient.createUUID({ legacyFormat: false });
    const dto: Partial<LabelTranslationDto> = {
      id: THE_ID,
      key: `MY-TEST-LABEL-${Date.now()}`,
      value: 'Yes this is translated',
      language: 'en'
    };

    it('POST', done => {
      client.translationAPI.postLabel(dto)
        .then(result => {
          assert(result, 'should return a result');
          assert(result.key === dto.key, 'should return the same key');
          assert(result.value === dto.value, 'should return the same value');
          assert(result.language === dto.language, 'should return the same language');
          assert(result.id, 'should return an id');
        })
        .then(_ => done())
        .catch(e => done(e));
    }).timeout(ClientConfigBuilder.getTestTimeout());

    it('GET', done => {
      client.translationAPI.getLabels()
        .then(result => {
          assert((result?.content?.length || 0) > 0, 'should not be empty');
          const label = result?.content.find(l => l.key === dto.key);
          assert(label, 'should find the label');
        })
        .then(_ => done())
        .catch(e => done(e));
    }).timeout(ClientConfigBuilder.getTestTimeout());

    it('GET with params/filter', done => {
      client.translationAPI.getLabels({
        filter: `locale=='cn'`,
        size: 1,
        page: 0,
        sort: 'key,asc',
      })
        .then(result => {
          assert((result?.content?.length || 0) === 0, 'should not have results');
        })
        .then(_ => done())
        .catch(e => done(e));
    }).timeout(ClientConfigBuilder.getTestTimeout());


    it('PUT', done => {
      client.translationAPI.putLabel({ ...dto, value: 'Updated translation' })
        .then(result => {
          assert(result, 'should return a result');
          assert(result.key === dto.key, 'should return the same key');
          assert(result.value === 'Updated translation', 'should return the updated value');
        })
        .then(_ => done())
        .catch(e => done(e));
    }).timeout(ClientConfigBuilder.getTestTimeout());


    it('DELETE', done => {
      client.translationAPI.deleteLabel(THE_ID)
        .then(result => {
          assert(result === '', 'should return an empty string on delete');
        })
        .then(_ => done())
        .catch(e => done(e));
    }).timeout(ClientConfigBuilder.getTestTimeout());

  });


  describe('Values', () => {
    const THE_ID = CoreAPIClient.createUUID({ legacyFormat: false });
    const prepare = async (id: string) => {
      const [{ equipment }] = await client.dataServiceAPI.post('Equipment', {
        id: CoreAPIClient.createUUID({ legacyFormat: true }),
        name: `MY-TEST-EQUIPMENT-${Date.now()}`,
      }).then(r => r.data)

      const dto: Partial<ValueTranslationDto<Partial<ValueTranslationDataDto>>> = {
        id: id,
        fieldName: 'name',
        objectType: 'Equipment',
        objectId: equipment.id!,
        values: [
          {
            value: `MY-TEST-VALUE-${Date.now()}`,
            locale: 'en'
          }
        ]
      };

      const cleanup = async () => {
        try {
          await client.dataServiceAPI.deleteById('Equipment', equipment as any);
        } catch (e) {
          // ignore
        }
      }

      return { dto, THE_ID: id, equipment, cleanup };
    }

    // todo: API is not GA yet - enable when it is
    xit('POST, GET(with params/filter), PUT, DELETE', done => {

      prepare(THE_ID)
        .then(({ dto, equipment, cleanup }) => {
          return client.translationAPI.postValue(dto)
            .then(result => assert(result?.id === dto.id, 'should return the same id'))
            .then(_ => client.translationAPI.getValues({
              filter: `objectType=='Equipment' and id=='${dto.id}'`,
              size: 1,
              page: 0,
              sort: 'objectType,asc',
            }))
            .then(result => {
              assert((result?.content?.length || 0) === 1, 'should have one result');
              const val = result?.content[0];
              assert(val?.objectId === equipment.id, 'should have the same objectId');
            })
            .then(_ => client.translationAPI.putValue({ ...dto, values: [{ value: 'Updated value', locale: 'en' }] }))
            .then(result => {
              assert(result, 'should return a result');
              assert(result.id === dto.id, 'should return the same id');
              assert(result.values?.[0].value === 'Updated value', 'should return the updated value');
            })
            .then(_ => client.translationAPI.deleteValue(dto.id!))
            .then(result => assert(result === '', 'should return an empty string on delete'))
            .then(_ => done())
            .catch(e => done(e))
            .then(_ => cleanup());
        })

    }).timeout(ClientConfigBuilder.getTestTimeout());

  });

});
