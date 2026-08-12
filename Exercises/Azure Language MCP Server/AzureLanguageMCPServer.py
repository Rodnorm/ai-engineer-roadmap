from dotenv import load_dotenv
import os

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential


def main():
    try:
        os.system('cls' if os.name == 'nt' else 'clear')
        # Carrega as variavies de ambiente
        load_dotenv()
        

        # Retira o endpoint contido na variavel
        foundry_endpoint = os.getenv('AZURE_NLP_MCP_COURSE')

        # Obtem as credenciais de usuario
        credential = DefaultAzureCredential()

        # Pega o projeto do Foundry
        project_client = AIProjectClient(
            endpoint=foundry_endpoint,
            credential=credential
        )

        # Cria o client da sessao
        openai_client = project_client.get_openai_client()
        print("First step done. OpenAi_client:", openai_client)

    except Exception as ex:
        print(ex)

    try:
        # Dados obtidos das configs do Agent no Foundry
        my_agent= "Azure-NLP-MCP-Course"
        my_version="3"
        
        response = openai_client.responses.create(
                input=[{
                    "role":"user",
                    "content":"Tell me where you can help with"
                }],
                extra_body={
                    "agent_reference": {
                        "name": my_agent,
                        "version": my_version,
                        "type": "agent_reference"
                        }
                }
        )
        
        print("Response:", response.output_text)
    except Exception as ex:
            print("Error calling Azure OpenAI", ex)
if __name__ == "__main__":
    main()