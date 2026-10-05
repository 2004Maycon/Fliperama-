import os
import zipfile
import requests


BASE_URL = "https://plataforma-gestao-api.onrender.com"


url_catalogo = f"{BASE_URL}/api/jogos"

print(f"Buscando catálogo em: {url_catalogo}")
resposta = requests.get(url_catalogo)

if resposta.status_code == 200:
  jogos = resposta.json()
  print(f"Total de jogos encontrados no catálogo: {len(jogos)}")


  pasta_zips = "pacotes_jogos"
  pasta_jogos_prontos = "jogos_instalados"

  os.makedirs(pasta_zips, exist_ok=True)
  os.makedirs(pasta_jogos_prontos, exist_ok=True)


  for jogo in jogos:
    jogo_id = jogo.get("id")
    nome_jogo = jogo.get("nome", f"jogo_{jogo_id}")

    if not jogo_id:
      continue

    print(f"\nProcessando jogo: {nome_jogo} (ID: {jogo_id})")

    url_pacote = f"{BASE_URL}/api/jogos/{jogo_id}/pacote"
    resposta_pacote = requests.get(url_pacote, stream=True)

    if resposta_pacote.status_code == 200:
      caminho_zip = os.path.join(pasta_zips, f"jogo_{jogo_id}.zip")

     
      with open(caminho_zip, "wb") as f:
        for chunk in resposta_pacote.iter_content(chunk_size=8192):
          f.write(chunk)

      print("-> Pacote baixado com sucesso.")

    
      pasta_destino_jogo = os.path.join(pasta_jogos_prontos, f"jogo_{jogo_id}")
      os.makedirs(pasta_destino_jogo, exist_ok=True)

      with zipfile.ZipFile(caminho_zip, "r") as zip_ref:
        zip_ref.extractall(pasta_destino_jogo)

      print(f"-> Jogo extraído e pronto para uso em: {pasta_destino_jogo}")

    else:
      print(
          f"Erro ao baixar o pacote do jogo {jogo_id}. Código:"
          f" {resposta_pacote.status_code}"
      )

else:
  print(f"Erro ao acessar o catálogo. Código: {resposta.status_code}")