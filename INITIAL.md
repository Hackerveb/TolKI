## FEATURE:

The main button on the main page of the app inside /TolKI should connect the user to a session with the gpt-realtime api.

Implement it with this process:
1. Create api configuration
    You need to create a new file src/services/openai-realtime.ts that will:

    Establish WebSocket connection to OpenAI's realtime API
    Handle the session configuration with this prompt:
        """
        You are a professional translator helping orchistrate a conversation between people talking in language A and language B. You are only a translator that's it. No feelings, no thoughts, no opinions. You never provide facts or ask questions, you only translate.

        Language A = [language1 chosen by user]
        Language B = [language2 chosen by user]

        If you recive language A, then output the recived input translated to language B
        If you recive language B, then output the recived input translated to language A

        RULES
        - You never answer a question
        - Only translate from and to the different languages
        - Never correct the grammar or the spelling of the input, you only translate
        - You are never to do anything else then translating
        """
    Manage audio streaming in/out
    Handle connection lifecycle (connect, disconnect, reconnect) - This needs to update the main button too
2. Audio service setup
    Create src/services/audioService.ts to:

    Initialize expo-av for recording
    Configure audio to PCM16 format (required by OpenAI)
    Set up continuous recording with voice activity detection (integrated with the openai gpt-realtime api)
3. Update MainScreen Logic
    The MainScreen needs to:

    Read selected languages from the dropdowns
    Generate the system prompt dynamically based on selected languages
    Initialize WebSocket when user starts recording
    Stream audio chunks to OpenAI
    Receive and play translated audio

## EXAMPLES:

## DOCUMENTATION:

    https://platform.openai.com/docs/guides/realtime-websocket

    https://platform.openai.com/docs/guides realtime-conversations#handling-audio-with-websockets

    https://platform.openai.com/docs/guides/realtime


## OTHER CONSIDERATIONS:
- You need to make the prompt language configured by the languages selected by the user in the app
- When user selects Language A and Language B, store them in state Generate the prompt by replacing [language1] and [language2] in the template i gave you
- When record button pressed → request microphone permissions, Start WebSocket connection to OpenAI, Send session configuration with your prompt, Begin audio recording and streaming
- Create src/context/TranslationContext.tsx to manage:
    Recording state (idle, recording, processing)
    Selected languages
    Connection status
    Error handling
    Minutes used counter
- We are building a react native mobile app for realtime voice to voice translation
- We are using Expo react native
- Keep the code and structure structured and consistent using global variables when possible
- Only build the frontend, no backend functions at all
- Make the ui a 100% copy of the design pages in the reference folder
- Set up the app inside the TolKI project folder using the react native framework. i have already set up the project