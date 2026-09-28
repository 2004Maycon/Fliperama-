import os
import requests

# Endereço base da sua API hospedada no Render
BASE_URL = "https://plataforma-gestao-api.onrender.com"

# 1. Buscar o catálogo de jogos (por padrão, traz os aprovados)
url_catalogo = f"{BASE_URL}/api/jogos"

print(f"Buscando catálogo em: {url_catalogo}")
resposta = requests.get(url_catalogo)

if resposta.status_code == 200:
  jogos = resposta.json()
  print(f"Total de jogos encontrados no catálogo: {len(jogos)}")

  # Cria uma pasta para salvar os pacotes se ela não existir
  os.makedirs("pacotes_jogos", exist_ok=True)

  # 2. Percorrer cada jogo para baixar o pacote da versão aprovada
  for jogo in jogos:
    # Ajuste o campo conforme o que a API retorna (geralmente 'id' ou 'codigo')
    jogo_id = jogo.get("id")
    nome_jogo = jogo.get("nome", f"jogo_{jogo_id}")

    if not jogo_id:
      continue

    print(f"\nBaixando pacote para o jogo: {nome_jogo} (ID: {jogo_id})")

    url_pacote = f"{BASE_URL}/api/jogos/{jogo_id}/pacote"

    # Faz o download do arquivo ZIP
    resposta_pacote = requests.get(url_pacote, stream=True)

    if resposta_pacote.status_code == 200:
      # Nome do arquivo zip que será salvo localmente
      caminho_zip = os.path.join("pacotes_jogos", f"jogo_{jogo_id}.zip")

      with open(caminho_zip, "wb") as f:
        for chunk in resposta_pacote.iter_content(chunk_size=8192):
          f.write(chunk)

      print(f"Sucesso! Pacote salvo em: {caminho_zip}")

    else:
      print(
          f"Erro ao baixar o pacote do jogo {jogo_id}. Código:"
          f" {resposta_pacote.status_code}"
      )

else:
  print(f"Erro ao acessar o catálogo. Código: {resposta.status_code}")