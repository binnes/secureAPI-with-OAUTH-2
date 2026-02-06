# WebChat Widget API usage

This page outlines how the embedded chat widget interacts with Orchestrate. It will help when referring to the API documentation in understanding how the various endpoints can be used.

## When there is no JWT Tokens

This document refers to the Developer Edition, additional research may be needed to understand the differences between the Developer and Enterprise Edition.

Once the chat widget is loaded and initialized and displaying the initial prompt, when a user enters the first question the following API calls are made (the following details were made using Safari Browser on MacOS):

```mermaid
sequenceDiagram
    participant User
    participant Widget as WebChat Widget
    participant API as Orchestrate API
    
    Note over User,API: Initial Message Flow
    User->>Widget: Enters "Hello" and presses enter
    Widget->>API: POST /api/v1/threads<br/>(Create new thread)
    API-->>Widget: 201 Created<br/>thread_id: fd438015-df29-4b3b-9fa3-d84c61871336
    Widget->>API: POST /api/v1/orchestrate/runs?stream=true<br/>(Send message with thread_id)
    API-->>Widget: 200 OK (Streamed Response)
    Note over API,Widget: Stream Events:<br/>run.started → message.started →<br/>run.step.intermediate (multiple) →<br/>message.delta → message.created →<br/>message.completed → run.completed → done
    Widget->>User: Display response: "Hello! I am Watsonx Orchestrate..."
    
    Note over User,API: Follow-up Message Flow
    User->>Widget: Enters "what context variables do you accept?"
    Widget->>API: POST /api/v1/orchestrate/runs?stream=true<br/>(Send message with existing thread_id)
    API-->>Widget: 200 OK (Streamed Response)
    Note over API,Widget: Stream Events:<br/>run.started → message.started →<br/>run.step.intermediate (multiple) →<br/>message.delta → message.created →<br/>message.completed → run.completed → done
    Widget->>User: Display response
```

User enters **Hello** in the chat text panel and presses enter to send the request:

### Request

POST request to http://localhost:4321/api/v1/threads

Headers:
| Key | Value |
| --- | --- |
| Accept |  application/json, text/plain, */* |
| Accept-Encoding |  gzip, deflate |
| Accept-Language | en-GB,en;q=0.9 |
| Access-Control-Allow-Origin |  * |
| Authorization |  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYiLCJ1c2VybmFtZSI6Ind4by5hcmNoZXJAaWJtLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJ0ZW5hbnRfaWQiOiI1NzVlZjhlZi1jMDBmLTQyYzYtOWM2Mi0zNzRkN2Y1ZTdjZTMiLCJ3b1RlbmFudElkIjoiNTc1ZWY4ZWYtYzAwZi00MmM2LTljNjItMzc0ZDdmNWU3Y2UzIiwid29Vc2VySWQiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYifQ._sixstlvH2D0eKfvQV3289kOstxSKKuQ7OFeEWHfsoM |
| Connection | keep-alive |
| Content-Length | 67 |
| Content-Type | application/json |
| Origin | http://localhost:4000 |
| Priority | u=3, i |
| Referer | http://localhost:4000/ |
| Sec-Fetch-Dest | empty |
| Sec-Fetch-Mode | cors |
| Sec-Fetch-Site | same-site |
| User-Agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) | Version/26.2 Safari/605.1.15 |
| x-ibm-request-id | 5a1897ce-ef1c-4e8a-9b92-47622f519fb2 |

Body:
{"title":"hello","agent_id":"0c191f04-78cd-45e3-a99a-988cfb29434d"}

### Response

HTTP/1.1 201 Created

Headers:
| Key | Value |
| --- | --- |
| Access-Control-Allow-Origin | * |
| Content-Length | 52 |
| Content-Type | application/json |
| Date | Fri, 06 Feb 2026 16:57:04 GMT |
| Location | /threads/fd438015-df29-4b3b-9fa3-d84c61871336 |
| Server | uvicorn |

Body:

```json
{
    "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"
}
```

### Request

POST request to http://localhost:4321/api/v1/orchestrate/runs?stream=true&stream_timeout=120000&multiple_content=true

Headers:
| Key | Value |
| --- | --- |
| Accept | */*
| Accept-Encoding | gzip, deflate |
| Accept-Language | en-GB,en;q=0.9 |
| Access-Control-Allow-Origin | * |
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.| eyJzdWIiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYiLCJ1c2VybmFtZSI6Ind4by5hcmNoZXJAaWJtLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJ0ZW5hbnRfaWQiOiI1NzVlZjhlZi1jMDBmLTQyYzYtOWM2Mi0zNzRkN2Y1ZTdjZTMiLCJ3b1RlbmFudElkIjoiNTc1ZWY4ZWYtYzAwZi00MmM2LTljNjItMzc0ZDdmNWU3Y2UzIiwid29Vc2VySWQiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYifQ._sixstlvH2D0eKfvQV3289kOstxSKKuQ7OFeEWHfsoM |
| Connection | keep-alive |
| Content-Length | 206 |
| Content-Type | application/json |
| Origin | http://localhost:4000 |
| Priority | u=3, i |
| Referer | http://localhost:4000/ |
| Sec-Fetch-Dest | empty |
| Sec-Fetch-Mode | cors |
| Sec-Fetch-Site | same-site |
| User-Agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) | Version/26.2 Safari/605.1.15 |
| x-ibm-request-id | 00402e6d-55c0-457c-a9f2-b5d6fa1aed3f |
| x-watson-channel | agentic_chat |

Body:

```json
{
  "message":{"role":"user","content":"hello"},
  "additional_properties":{},
  "context":{},
  "agent_id":"0c191f04-78cd-45e3-a99a-988cfb29434d",
  "thread_id":"fd438015-df29-4b3b-9fa3-d84c61871336",
  "environment_id":""
}
```

### Response - streamed

HTTP/1.1 200 OK

Headers:
| Key | Value |
| --- | --- |
| Access-Control-Allow-Credentials | true |
| Access-Control-Allow-Origin | *
| Content-Type | text/event-stream; charset=utf-8 |
Date | Fri, 06 Feb 2026 16:57:05 GMT |
| Server | uvicorn |
| Transfer-Encoding | chunked |

Body:

```json
{"id": "1770397025369-0", "event": "run.started", "data": {"run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
{"id": "1770397025378-0", "event": "message.started", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e"}}
{"id": "1770397025405-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397025406-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397025407-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "gettingAgentSetup", "text": "Getting the agent set up to handle this…"}}}
{"id": "1770397025430-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingGuidelines", "text": "Preparing the right guidelines for your request…"}}}
{"id": "1770397025433-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397025434-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397027182-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "pullingEverythingTogether", "text": "Pulling everything together…"}}}
{"id": "1770397027183-0", "event": "message.delta", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "delta": {"role": "assistant", "content": [{"id": "1", "response_type": "text", "text": "Hello! I am Watsonx Orchestrate, an AI assistant, created by IBM. How can I help you today?"}]}}}
{"id": "1770397027189-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "wrappingUpFinalResponse", "text": "Wrapping up with the final response…"}}}
{"id": "1770397027212-0", "event": "message.created", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "message_id": "060f231a-bac4-484d-9181-17e8f04e64ad", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "message": {"id": "060f231a-bac4-484d-9181-17e8f04e64ad", "tenant_id": "575ef8ef-c00f-42c6-9c62-374d7f5e7ce3", "created_by": "f242eadf-0dc9-4eae-b2d7-65b09b4b4b16", "created_by_username": "wxo.archer@ibm.com", "created_on": "2026-02-06T16:57:07.195386Z", "updated_at": "2026-02-06T16:57:07.195386Z", "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "assistant": {"is_default": true}, "parent_message_id": "f55ce8b9-a222-4a62-9a85-70c7eed5322f", "role": "assistant", "content": [{"response_type": "text", "id": "1", "text": "Hello! I am Watsonx Orchestrate, an AI assistant, created by IBM. How can I help you today?"}], "mentions": null, "document_ids": null, "additional_properties": {"display_properties": {"skip_render": false, "is_async": false}, "is_interrupt": false}, "context": null, "step_history": [], "message_state": null}}}
{"id": "1770397027213-0", "event": "message.completed", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e"}}
{"id": "1770397027222-0", "event": "run.completed", "data": {"run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "context": {}, "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
{"id": "1770397027222-1", "event": "done", "data": {"run_id": "a6d81785-d70e-4e9d-a858-6df96b4d383e", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "context": {}, "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
```

User then types **what context variables do you accept?**

### Request

POST request to  http://localhost:4321/api/v1/orchestrate/runs?stream=true&stream_timeout=120000&multiple_content=true

Headers:
| Key | Value |
| --- | --- |
| Accept | */* |
| Accept-Encoding | gzip, deflate |
| Accept-Language | en-GB,en;q=0.9 |
| Access-Control-Allow-Origin | * |
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYiLCJ1c2VybmFtZSI6Ind4by5hcmNoZXJAaWJtLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJ0ZW5hbnRfaWQiOiI1NzVlZjhlZi1jMDBmLTQyYzYtOWM2Mi0zNzRkN2Y1ZTdjZTMiLCJ3b1RlbmFudElkIjoiNTc1ZWY4ZWYtYzAwZi00MmM2LTljNjItMzc0ZDdmNWU3Y2UzIiwid29Vc2VySWQiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYifQ._sixstlvH2D0eKfvQV3289kOstxSKKuQ7OFeEWHfsoM |
| Content-Length | 238 |
| Content-Type | application/json |
| Origin | http://localhost:4000 |
| Priority | u=3, i |
| Referer | http://localhost:4000/ |
| Sec-Fetch-Dest | empty |
| Sec-Fetch-Mode | cors |
| Sec-Fetch-Site | same-site |
| User-Agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) | Version/26.2 Safari/605.1.15 |
| x-ibm-request-id | b8027370-a04f-4929-9453-5d36aeefdcca |
| x-watson-channel | agentic_chat |

Body:

```json
{
  "message":{"role":"user","content":"what context variables do you accept?"},
  "additional_properties":{},
  "context":{},
  "agent_id":"0c191f04-78cd-45e3-a99a-988cfb29434d",
  "thread_id":"fd438015-df29-4b3b-9fa3-d84c61871336",
  "environment_id":""
}
```

### Response - streamed
 
HTTP/1.1 200 OK

Headers:
| Key | Value |
| --- | --- |
| Access-Control-Allow-Credentials | true |
| Access-Control-Allow-Origin | * |
| Content-Type | text/event-stream; charset=utf-8 |
| Date | Fri, 06 Feb 2026 17:11:55 GMT |
| Server | uvicorn |
| Transfer-Encoding | chunked |

Body:

```json
{"id": "1770397917176-0", "event": "run.started", "data": {"run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
{"id": "1770397917190-0", "event": "message.started", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b"}}
{"id": "1770397917214-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397917215-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397917217-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "gettingAgentSetup", "text": "Getting the agent set up to handle this…"}}}
{"id": "1770397917241-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingGuidelines", "text": "Preparing the right guidelines for your request…"}}}
{"id": "1770397917244-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397917245-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397921131-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "pullingEverythingTogether", "text": "Pulling everything together…"}}}
{"id": "1770397921134-0", "event": "message.delta", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "delta": {"role": "assistant", "content": [{"id": "1", "response_type": "text", "text": ""}]}}}
{"id": "1770397921141-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397921143-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397921144-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "gettingAgentSetup", "text": "Getting the agent set up to handle this…"}}}
{"id": "1770397921163-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "preparingYourResponse", "text": "Preparing your response…"}}}
{"id": "1770397921165-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "thinkingThisThrough", "text": "Thinking this through…"}}}
{"id": "1770397922866-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "pullingEverythingTogether", "text": "Pulling everything together…"}}}
{"id": "1770397922875-0", "event": "message.delta", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "delta": {"role": "assistant", "content": [{"id": "1", "response_type": "text", "text": ""}]}}}
{"id": "1770397922892-0", "event": "run.step.intermediate", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_display_name": "context_variables_test_agent", "current_agent": "context_variables_test_agent", "message": {"key": "wrappingUpFinalResponse", "text": "Wrapping up with the final response…"}}}
{"id": "1770397922940-0", "event": "message.created", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "message_id": "dda5f971-d22b-4ebd-8d98-6ce810cdfbbe", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "message": {"id": "dda5f971-d22b-4ebd-8d98-6ce810cdfbbe", "tenant_id": "575ef8ef-c00f-42c6-9c62-374d7f5e7ce3", "created_by": "f242eadf-0dc9-4eae-b2d7-65b09b4b4b16", "created_by_username": "wxo.archer@ibm.com", "created_on": "2026-02-06T17:12:02.910641Z", "updated_at": "2026-02-06T17:12:02.910641Z", "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "assistant": {"is_default": true}, "parent_message_id": "9b07de94-d168-4931-a457-e420e0c178bc", "role": "assistant", "content": [{"response_type": "text", "id": "1", "text": "The user is asking about the context variables that I accept. To answer this, I need to recall the list of accepted variables."}], "mentions": null, "document_ids": null, "additional_properties": {"display_properties": {"skip_render": false, "is_async": false}, "is_interrupt": false}, "context": null, "step_history": [], "message_state": null}}}
{"id": "1770397922943-0", "event": "message.completed", "data": {"thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336", "run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b"}}
{"id": "1770397922954-0", "event": "run.completed", "data": {"run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "context": {}, "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
{"id": "1770397922956-0", "event": "done", "data": {"run_id": "54c58fd9-272b-405c-81ac-14247b08fb1b", "agent_id": "0c191f04-78cd-45e3-a99a-988cfb29434d", "context": {}, "thread_id": "fd438015-df29-4b3b-9fa3-d84c61871336"}}
```
