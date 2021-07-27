import assert = require('assert');
import { BatchResponse } from '../core/batch-response';

describe('BatchResponse', () => {

  it('should parse response with one DATA-API child response', () => {

    const batchApiResponse = `--1243c0e0-342f-4b9f-933c-6026cd99780b
Content-ID: req0
Content-Type: application/http

HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: https://et.dev.coresuite.com/api/data/v4/Activity/DDEFFC52A88A4B888887F81E551F1CEB

{"data":[{"activity":{"checkedOut":null,"previousActivity":null,"code":"7865","travelTimeFromInMinutes":30,"businessPartner":"CBDDD1207CAB4E59A5BC459ACEA81647","projectPhase":null,"subject":"can not be planed no address right ?","project":null,"owners":null,"sourceActivity":null,"type":"ASSIGNMENT","businessProcessStepAssignments":[],"syncObjectKPIs":null,"number":null,"inactive":false,"travelTimeToInMinutes":30,"contact":null,"id":"DDEFFC52A88A4B888887F81E551F1CEB","address":null,"earliestStartDateTime":"2017-07-21T09:40:00Z","lastChanged":1500809674366,"reminderDateTime":null,"activityTemplate":null,"changelog":null,"equipment":null,"createPerson":"14523B3D57424338858CB56BBF120696","externalId":null,"groups":null,"personal":false,"endDateTime":"2017-07-21T21:59:00Z","branches":null,"predecessorActivities":[],"createDateTime":"2017-07-22T09:54:03Z","startDateTime":"2017-07-21T09:40:00Z","dueDateTime":"2017-07-21T21:59:00Z","udfMetaGroups":null,"executionStage":"DISPATCHING","topic":null,"responsibles":[],"subType":null,"location":null,"udfValues":[{"meta":"770B1BA59338483D928975E5BBE0D02C","value":"DISPATCH_TO_CROWD_FAILED"},{"meta":"8C5D24C273F9495C84E4A4A592C5B6B0","value":"true"}],"lastChangedBy":"14523B3D57424338858CB56BBF120696","remarks":null,"syncStatus":"IN_CLOUD","object":{"objectId":"E12CD76F0B6646F8ADE48E228CDB547D","objectType":"SERVICECALL"},"status":"DRAFT"}}]}
--1243c0e0-342f-4b9f-933c-6026cd99780b--`;

    const result = new BatchResponse(batchApiResponse).toJson();

    assert.deepStrictEqual(result, [
      {
        'body': {
          'data': [
            {
              'activity': {
                'checkedOut': null,
                'previousActivity': null,
                'code': '7865',
                'travelTimeFromInMinutes': 30,
                'businessPartner': 'CBDDD1207CAB4E59A5BC459ACEA81647',
                'projectPhase': null,
                'subject': 'can not be planed no address right ?',
                'project': null,
                'owners': null,
                'sourceActivity': null,
                'type': 'ASSIGNMENT',
                'businessProcessStepAssignments': [],
                'syncObjectKPIs': null,
                'number': null,
                'inactive': false,
                'travelTimeToInMinutes': 30,
                'contact': null,
                'id': 'DDEFFC52A88A4B888887F81E551F1CEB',
                'address': null,
                'earliestStartDateTime': '2017-07-21T09:40:00Z',
                'lastChanged': 1500809674366,
                'reminderDateTime': null,
                'activityTemplate': null,
                'changelog': null,
                'equipment': null,
                'createPerson': '14523B3D57424338858CB56BBF120696',
                'externalId': null,
                'groups': null,
                'personal': false,
                'endDateTime': '2017-07-21T21:59:00Z',
                'branches': null,
                'predecessorActivities': [],
                'createDateTime': '2017-07-22T09:54:03Z',
                'startDateTime': '2017-07-21T09:40:00Z',
                'dueDateTime': '2017-07-21T21:59:00Z',
                'udfMetaGroups': null,
                'executionStage': 'DISPATCHING',
                'topic': null,
                'responsibles': [],
                'subType': null,
                'location': null,
                'udfValues': [
                  {
                    'meta': '770B1BA59338483D928975E5BBE0D02C',
                    'value': 'DISPATCH_TO_CROWD_FAILED'
                  },
                  {
                    'meta': '8C5D24C273F9495C84E4A4A592C5B6B0',
                    'value': 'true'
                  }
                ],
                'lastChangedBy': '14523B3D57424338858CB56BBF120696',
                'remarks': null,
                'syncStatus': 'IN_CLOUD',
                'object': {
                  'objectId': 'E12CD76F0B6646F8ADE48E228CDB547D',
                  'objectType': 'SERVICECALL'
                },
                'status': 'DRAFT'
              }
            }
          ]
        },
        'statusCode': 201,
        'contentType': 'application/json;charset=utf-8',
        'requestOptions': {
          'url': 'https://et.dev.coresuite.com/api/data/v4/Activity/DDEFFC52A88A4B888887F81E551F1CEB',
          'contentId': 'req0'
        }
      }
    ]);
  });

  it('should parse response with 3 DATA-API child response', () => {

    const batchApiResponse = `
--b800e001-c41f-4017-b579-6f329278e39a
Content-ID: req0
Content-Type: application/http

HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: https://et.dev.coresuite.com/api/data/v4/Activity/91551B6A83D34FAAA529CDE9588F5F15

{"data":[{"activity":{"checkedOut":null,"previousActivity":null,"code":"7868","travelTimeFromInMinutes":null,"businessPartner":"6B4A39D9C532489A80A44052F7EB6F7E","projectPhase":null,"subject":"plan me2","project":null,"owners":null,"sourceActivity":null,"type":"ASSIGNMENT","businessProcessStepAssignments":[],"syncObjectKPIs":null,"number":null,"inactive":false,"travelTimeToInMinutes":null,"contact":null,"id":"91551B6A83D34FAAA529CDE9588F5F15","address":"C77F97E246314EB889C7F229B2D9F581","earliestStartDateTime":"2017-07-23T17:34:17Z","lastChanged":1500831327727,"reminderDateTime":null,"activityTemplate":null,"changelog":null,"equipment":null,"createPerson":"14523B3D57424338858CB56BBF120696","externalId":null,"groups":null,"personal":false,"endDateTime":"2017-07-23T19:34:17Z","branches":null,"predecessorActivities":[],"createDateTime":"2017-07-23T17:34:30Z","startDateTime":"2017-07-23T17:34:17Z","dueDateTime":"2017-07-23T21:59:59Z","udfMetaGroups":null,"executionStage":"DISPATCHING","topic":null,"responsibles":["0A8063203AF3409FB77E6E23809E401F"],"subType":null,"location":null,"udfValues":[{"meta":"770B1BA59338483D928975E5BBE0D02C","value":"DISPATCHED_TO_CROWD"},{"meta":"8C5D24C273F9495C84E4A4A592C5B6B0","value":"true"}],"lastChangedBy":"14523B3D57424338858CB56BBF120696","remarks":null,"syncStatus":"IN_CLOUD","object":{"objectId":"9A52AD2A52E14027B45C52A7248D6F1D","objectType":"SERVICECALL"},"status":"DRAFT"}}]}
--b800e001-c41f-4017-b579-6f329278e39a
Content-ID: req1
Content-Type: application/http

HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: https://et.dev.coresuite.com/api/data/v4/ServiceAssignment/EFEDECFB2BD64007BD575F4ABD92A289

{"data":[{"serviceAssignment":{"code":null,"travelTimeFromInMinutes":12,"activity":"91551B6A83D34FAAA529CDE9588F5F15","recurrencePattern":null,"releasedDateTime":null,"technicianFixed":null,"owners":null,"objectGroup":null,"sourceActivity":null,"confirmed":null,"businessProcessStepAssignments":[],"syncObjectKPIs":null,"inactive":false,"travelTimeToInMinutes":16,"endDateTimeFixed":null,"state":"ASSIGNED","id":"EFEDECFB2BD64007BD575F4ABD92A289","sentToTechnicianDateTime":null,"released":false,"recurrenceSeriesId":null,"lastChanged":1500831327783,"changelog":null,"createPerson":"14523B3D57424338858CB56BBF120696","externalId":null,"groups":null,"technician":"0A8063203AF3409FB77E6E23809E401F","endDateTime":"2017-07-23T19:34:17Z","branches":null,"createDateTime":"2017-07-23T17:35:27Z","unit":null,"startDateTime":"2017-07-23T17:34:17Z","proposed":null,"udfMetaGroups":null,"recurrencePatternLastChanged":null,"startDateTimeFixed":null,"location":null,"udfValues":null,"remarks":null,"syncStatus":"IN_CLOUD","object":{"objectId":"9A52AD2A52E14027B45C52A7248D6F1D","objectType":"SERVICECALL"}}}]}
--b800e001-c41f-4017-b579-6f329278e39a
Content-ID: req2
Content-Type: application/http

HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: https://et.dev.coresuite.com/api/data/v4/Activity/48974E1BFF75493CA2D271C1F1819A4F

{"data":[{"activity":{"checkedOut":null,"previousActivity":null,"code":"7869","travelTimeFromInMinutes":null,"businessPartner":"9ACF9C1B6DF04427946CC05BF5A3A2D1","projectPhase":null,"subject":"plan me 3","project":null,"owners":null,"sourceActivity":null,"type":"ASSIGNMENT","businessProcessStepAssignments":[],"syncObjectKPIs":null,"number":null,"inactive":false,"travelTimeToInMinutes":null,"contact":null,"id":"48974E1BFF75493CA2D271C1F1819A4F","address":"C5104FDB2C5C4DE094EACE156D128DE9","earliestStartDateTime":"2017-07-23T17:34:40Z","lastChanged":1500831327895,"reminderDateTime":null,"activityTemplate":null,"changelog":null,"equipment":null,"createPerson":"14523B3D57424338858CB56BBF120696","externalId":null,"groups":null,"personal":false,"endDateTime":"2017-07-23T22:01:06Z","branches":null,"predecessorActivities":[],"createDateTime":"2017-07-23T17:34:52Z","startDateTime":"2017-07-23T20:01:06Z","dueDateTime":"2017-07-23T21:59:59Z","udfMetaGroups":null,"executionStage":"DISPATCHING","topic":null,"responsibles":["0A8063203AF3409FB77E6E23809E401F"],"subType":null,"location":null,"udfValues":[{"meta":"770B1BA59338483D928975E5BBE0D02C","value":"DISPATCHED_TO_CROWD"},{"meta":"8C5D24C273F9495C84E4A4A592C5B6B0","value":"true"}],"lastChangedBy":"14523B3D57424338858CB56BBF120696","remarks":null,"syncStatus":"IN_CLOUD","object":{"objectId":"B03FC46DE95F4045BCF0C3E2C51CE966","objectType":"SERVICECALL"},"status":"DRAFT"}}]}
--b800e001-c41f-4017-b579-6f329278e39a
Content-ID: req3
Content-Type: application/http

HTTP/1.1 201 Created
Content-Type: application/json;charset=UTF-8
Location: https://et.dev.coresuite.com/api/data/v4/ServiceAssignment/35C43302484C45D0B3D0D1F8A5A0F427

{"data":[{"serviceAssignment":{"code":null,"travelTimeFromInMinutes":34,"activity":"48974E1BFF75493CA2D271C1F1819A4F","recurrencePattern":null,"releasedDateTime":null,"technicianFixed":null,"owners":null,"objectGroup":null,"sourceActivity":null,"confirmed":null,"businessProcessStepAssignments":[],"syncObjectKPIs":null,"inactive":false,"travelTimeToInMinutes":12,"endDateTimeFixed":null,"state":"ASSIGNED","id":"35C43302484C45D0B3D0D1F8A5A0F427","sentToTechnicianDateTime":null,"released":false,"recurrenceSeriesId":null,"lastChanged":1500831327942,"changelog":null,"createPerson":"14523B3D57424338858CB56BBF120696","externalId":null,"groups":null,"technician":"0A8063203AF3409FB77E6E23809E401F","endDateTime":"2017-07-23T22:01:06Z","branches":null,"createDateTime":"2017-07-23T17:35:27Z","unit":null,"startDateTime":"2017-07-23T20:01:06Z","proposed":null,"udfMetaGroups":null,"recurrencePatternLastChanged":null,"startDateTimeFixed":null,"location":null,"udfValues":null,"remarks":null,"syncStatus":"IN_CLOUD","object":{"objectId":"B03FC46DE95F4045BCF0C3E2C51CE966","objectType":"SERVICECALL"}}}]}
--b800e001-c41f-4017-b579-6f329278e39a--`;

    const result = new BatchResponse(batchApiResponse).toJson();
    assert.deepEqual(result, [
      {
        'body': {
          'data': [
            {
              'activity': {
                'checkedOut': null,
                'previousActivity': null,
                'code': '7868',
                'travelTimeFromInMinutes': null,
                'businessPartner': '6B4A39D9C532489A80A44052F7EB6F7E',
                'projectPhase': null,
                'subject': 'plan me2',
                'project': null,
                'owners': null,
                'sourceActivity': null,
                'type': 'ASSIGNMENT',
                'businessProcessStepAssignments': [],
                'syncObjectKPIs': null,
                'number': null,
                'inactive': false,
                'travelTimeToInMinutes': null,
                'contact': null,
                'id': '91551B6A83D34FAAA529CDE9588F5F15',
                'address': 'C77F97E246314EB889C7F229B2D9F581',
                'earliestStartDateTime': '2017-07-23T17:34:17Z',
                'lastChanged': 1500831327727,
                'reminderDateTime': null,
                'activityTemplate': null,
                'changelog': null,
                'equipment': null,
                'createPerson': '14523B3D57424338858CB56BBF120696',
                'externalId': null,
                'groups': null,
                'personal': false,
                'endDateTime': '2017-07-23T19:34:17Z',
                'branches': null,
                'predecessorActivities': [],
                'createDateTime': '2017-07-23T17:34:30Z',
                'startDateTime': '2017-07-23T17:34:17Z',
                'dueDateTime': '2017-07-23T21:59:59Z',
                'udfMetaGroups': null,
                'executionStage': 'DISPATCHING',
                'topic': null,
                'responsibles': [
                  '0A8063203AF3409FB77E6E23809E401F'
                ],
                'subType': null,
                'location': null,
                'udfValues': [
                  {
                    'meta': '770B1BA59338483D928975E5BBE0D02C',
                    'value': 'DISPATCHED_TO_CROWD'
                  },
                  {
                    'meta': '8C5D24C273F9495C84E4A4A592C5B6B0',
                    'value': 'true'
                  }
                ],
                'lastChangedBy': '14523B3D57424338858CB56BBF120696',
                'remarks': null,
                'syncStatus': 'IN_CLOUD',
                'object': {
                  'objectId': '9A52AD2A52E14027B45C52A7248D6F1D',
                  'objectType': 'SERVICECALL'
                },
                'status': 'DRAFT'
              }
            }
          ]
        },
        'statusCode': 201,
        'contentType': 'application/json;charset=utf-8',
        'requestOptions': {
          'url': 'https://et.dev.coresuite.com/api/data/v4/Activity/91551B6A83D34FAAA529CDE9588F5F15',
          'contentId': 'req0'
        }
      },
      {
        'body': {
          'data': [
            {
              'serviceAssignment': {
                'code': null,
                'travelTimeFromInMinutes': 12,
                'activity': '91551B6A83D34FAAA529CDE9588F5F15',
                'recurrencePattern': null,
                'releasedDateTime': null,
                'technicianFixed': null,
                'owners': null,
                'objectGroup': null,
                'sourceActivity': null,
                'confirmed': null,
                'businessProcessStepAssignments': [],
                'syncObjectKPIs': null,
                'inactive': false,
                'travelTimeToInMinutes': 16,
                'endDateTimeFixed': null,
                'state': 'ASSIGNED',
                'id': 'EFEDECFB2BD64007BD575F4ABD92A289',
                'sentToTechnicianDateTime': null,
                'released': false,
                'recurrenceSeriesId': null,
                'lastChanged': 1500831327783,
                'changelog': null,
                'createPerson': '14523B3D57424338858CB56BBF120696',
                'externalId': null,
                'groups': null,
                'technician': '0A8063203AF3409FB77E6E23809E401F',
                'endDateTime': '2017-07-23T19:34:17Z',
                'branches': null,
                'createDateTime': '2017-07-23T17:35:27Z',
                'unit': null,
                'startDateTime': '2017-07-23T17:34:17Z',
                'proposed': null,
                'udfMetaGroups': null,
                'recurrencePatternLastChanged': null,
                'startDateTimeFixed': null,
                'location': null,
                'udfValues': null,
                'remarks': null,
                'syncStatus': 'IN_CLOUD',
                'object': {
                  'objectId': '9A52AD2A52E14027B45C52A7248D6F1D',
                  'objectType': 'SERVICECALL'
                }
              }
            }
          ]
        },
        'statusCode': 201,
        'contentType': 'application/json;charset=utf-8',
        'requestOptions': {
          'url': 'https://et.dev.coresuite.com/api/data/v4/ServiceAssignment/EFEDECFB2BD64007BD575F4ABD92A289',
          'contentId': 'req1'
        }
      },
      {
        'body': {
          'data': [
            {
              'activity': {
                'checkedOut': null,
                'previousActivity': null,
                'code': '7869',
                'travelTimeFromInMinutes': null,
                'businessPartner': '9ACF9C1B6DF04427946CC05BF5A3A2D1',
                'projectPhase': null,
                'subject': 'plan me 3',
                'project': null,
                'owners': null,
                'sourceActivity': null,
                'type': 'ASSIGNMENT',
                'businessProcessStepAssignments': [],
                'syncObjectKPIs': null,
                'number': null,
                'inactive': false,
                'travelTimeToInMinutes': null,
                'contact': null,
                'id': '48974E1BFF75493CA2D271C1F1819A4F',
                'address': 'C5104FDB2C5C4DE094EACE156D128DE9',
                'earliestStartDateTime': '2017-07-23T17:34:40Z',
                'lastChanged': 1500831327895,
                'reminderDateTime': null,
                'activityTemplate': null,
                'changelog': null,
                'equipment': null,
                'createPerson': '14523B3D57424338858CB56BBF120696',
                'externalId': null,
                'groups': null,
                'personal': false,
                'endDateTime': '2017-07-23T22:01:06Z',
                'branches': null,
                'predecessorActivities': [],
                'createDateTime': '2017-07-23T17:34:52Z',
                'startDateTime': '2017-07-23T20:01:06Z',
                'dueDateTime': '2017-07-23T21:59:59Z',
                'udfMetaGroups': null,
                'executionStage': 'DISPATCHING',
                'topic': null,
                'responsibles': [
                  '0A8063203AF3409FB77E6E23809E401F'
                ],
                'subType': null,
                'location': null,
                'udfValues': [
                  {
                    'meta': '770B1BA59338483D928975E5BBE0D02C',
                    'value': 'DISPATCHED_TO_CROWD'
                  },
                  {
                    'meta': '8C5D24C273F9495C84E4A4A592C5B6B0',
                    'value': 'true'
                  }
                ],
                'lastChangedBy': '14523B3D57424338858CB56BBF120696',
                'remarks': null,
                'syncStatus': 'IN_CLOUD',
                'object': {
                  'objectId': 'B03FC46DE95F4045BCF0C3E2C51CE966',
                  'objectType': 'SERVICECALL'
                },
                'status': 'DRAFT'
              }
            }
          ]
        },
        'statusCode': 201,
        'contentType': 'application/json;charset=utf-8',
        'requestOptions': {
          'url': 'https://et.dev.coresuite.com/api/data/v4/Activity/48974E1BFF75493CA2D271C1F1819A4F',
          'contentId': 'req2'
        }
      },
      {
        'body': {
          'data': [
            {
              'serviceAssignment': {
                'code': null,
                'travelTimeFromInMinutes': 34,
                'activity': '48974E1BFF75493CA2D271C1F1819A4F',
                'recurrencePattern': null,
                'releasedDateTime': null,
                'technicianFixed': null,
                'owners': null,
                'objectGroup': null,
                'sourceActivity': null,
                'confirmed': null,
                'businessProcessStepAssignments': [],
                'syncObjectKPIs': null,
                'inactive': false,
                'travelTimeToInMinutes': 12,
                'endDateTimeFixed': null,
                'state': 'ASSIGNED',
                'id': '35C43302484C45D0B3D0D1F8A5A0F427',
                'sentToTechnicianDateTime': null,
                'released': false,
                'recurrenceSeriesId': null,
                'lastChanged': 1500831327942,
                'changelog': null,
                'createPerson': '14523B3D57424338858CB56BBF120696',
                'externalId': null,
                'groups': null,
                'technician': '0A8063203AF3409FB77E6E23809E401F',
                'endDateTime': '2017-07-23T22:01:06Z',
                'branches': null,
                'createDateTime': '2017-07-23T17:35:27Z',
                'unit': null,
                'startDateTime': '2017-07-23T20:01:06Z',
                'proposed': null,
                'udfMetaGroups': null,
                'recurrencePatternLastChanged': null,
                'startDateTimeFixed': null,
                'location': null,
                'udfValues': null,
                'remarks': null,
                'syncStatus': 'IN_CLOUD',
                'object': {
                  'objectId': 'B03FC46DE95F4045BCF0C3E2C51CE966',
                  'objectType': 'SERVICECALL'
                }
              }
            }
          ]
        },
        'statusCode': 201,
        'contentType': 'application/json;charset=utf-8',
        'requestOptions': {
          'url': 'https://et.dev.coresuite.com/api/data/v4/ServiceAssignment/35C43302484C45D0B3D0D1F8A5A0F427',
          'contentId': 'req3'
        }
      }
    ]);
  });
});
