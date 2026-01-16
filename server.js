const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3030;

// Função para converter nome de pasta para título legível
function formatProjectName(folderName) {
  return folderName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Função para formatar nome do tour
function formatTourName(projectName, tourFolder) {
  const tourName = tourFolder
    .replace(/TOUR/gi, "Tour ")
    .replace(/FINAL/gi, "Final ")
    .replace(/APTO/gi, "Apto ")
    .replace(/TORRE/gi, "Torre ");

  return `${projectName} - ${tourName}`;
}

// Função para mapear todos os tours
async function mapTours() {
  const srcPath = path.join(__dirname, "src");
  const toursMap = {};

  try {
    console.log("🔍 Mapeando tours...");

    // Lista todas as pastas dentro de src
    const projectFolders = await fs.readdir(srcPath, { withFileTypes: true });

    for (const folder of projectFolders) {
      if (folder.isDirectory()) {
        const projectPath = path.join(srcPath, folder.name);
        const projectName = formatProjectName(folder.name);
        toursMap[projectName] = [];

        // Lista conteúdo da pasta do projeto
        const contents = await fs.readdir(projectPath, { withFileTypes: true });

        for (const item of contents) {
          if (item.isDirectory()) {
            // Verifica se tem index.html dentro
            const indexPath = path.join(projectPath, item.name, "index.html");
            try {
              await fs.access(indexPath);
              // Arquivo existe, adiciona ao mapa
              toursMap[projectName].push({
                name: formatTourName(projectName, item.name),
                href: `/src/${folder.name}/${item.name}/index.html`,
              });
            } catch {
              // Não tem index.html nesta pasta, ignora
            }
          }
        }

        // Ordena os tours por nome
        toursMap[projectName].sort((a, b) => a.name.localeCompare(b.name));

        // Remove projetos sem tours
        if (toursMap[projectName].length === 0) {
          delete toursMap[projectName];
        }
      }
    }

    return toursMap;
  } catch (error) {
    console.error("❌ Erro ao mapear tours:", error.message);
    return null;
  }
}

// Função para carregar o tours-data.js existente
async function loadExistingToursData() {
  try {
    const filePath = path.join(__dirname, "tours-data.js");
    const content = await fs.readFile(filePath, "utf8");

    // Remove o "const toursData = " e o ";" do final
    const jsonStr = content
      .replace(/^const\s+toursData\s*=\s*/, "")
      .replace(/;[\s\n]*$/, "");

    return JSON.parse(jsonStr);
  } catch (error) {
    console.log("ℹ️ Arquivo tours-data.js não encontrado ou inválido");
    return null;
  }
}

// Função para comparar dois objetos de tours
function compareToursData(oldData, newData) {
  const oldJson = JSON.stringify(oldData, null, 2);
  const newJson = JSON.stringify(newData, null, 2);

  return oldJson === newJson;
}

// Função para salvar o novo tours-data.js
async function saveToursData(toursMap) {
  try {
    // Salva o objeto em um arquivo JS
    const outputJs = `const toursData = ${JSON.stringify(
      toursMap,
      null,
      2
    )};\n`;
    await fs.writeFile("tours-data.js", outputJs);

    // Salva também em JSON
    const outputJson = JSON.stringify(toursMap, null, 2);
    await fs.writeFile("tours-map.json", outputJson);

    console.log("✅ tours-data.js atualizado com sucesso!");

    const totalProjects = Object.keys(toursMap).length;
    const totalTours = Object.values(toursMap).reduce(
      (sum, tours) => sum + tours.length,
      0
    );
    console.log(`📊 Total de projetos: ${totalProjects}`);
    console.log(`📊 Total de tours: ${totalTours}`);

    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar tours-data.js:", error.message);
    return false;
  }
}

// Função para verificar e atualizar tours
async function checkAndUpdateTours() {
  console.log("\n🔄 Verificando estrutura de tours...\n");

  const newToursMap = await mapTours();

  if (!newToursMap) {
    console.log("❌ Erro ao mapear tours");
    return false;
  }

  const existingToursMap = await loadExistingToursData();

  if (!existingToursMap) {
    console.log("⚠️ Arquivo tours-data.js não existe, criando novo...");
    await saveToursData(newToursMap);
    return true;
  }

  const isEqual = compareToursData(existingToursMap, newToursMap);

  if (isEqual) {
    console.log("✅ tours-data.js está atualizado!");
    const totalProjects = Object.keys(newToursMap).length;
    const totalTours = Object.values(newToursMap).reduce(
      (sum, tours) => sum + tours.length,
      0
    );
    console.log(`📊 Total de projetos: ${totalProjects}`);
    console.log(`📊 Total de tours: ${totalTours}`);
    return false;
  } else {
    console.log("⚠️ Diferenças detectadas, atualizando tours-data.js...");
    await saveToursData(newToursMap);
    return true;
  }
}

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Endpoint para forçar remapeamento
app.get("/api/remap", async (req, res) => {
  console.log("\n🔄 Remapeamento forçado via API...\n");
  const updated = await checkAndUpdateTours();

  res.json({
    success: true,
    updated: updated,
    message: updated
      ? "Tours remapeados com sucesso!"
      : "Tours já estavam atualizados",
  });
});

// Endpoint para obter status
app.get("/api/status", async (req, res) => {
  const toursMap = await loadExistingToursData();

  if (!toursMap) {
    res.json({
      success: false,
      message: "tours-data.js não encontrado",
    });
    return;
  }

  const totalProjects = Object.keys(toursMap).length;
  const totalTours = Object.values(toursMap).reduce(
    (sum, tours) => sum + tours.length,
    0
  );

  res.json({
    success: true,
    totalProjects,
    totalTours,
    projects: Object.keys(toursMap),
  });
});

// Inicializa o servidor
async function startServer() {
  // Verifica e atualiza tours ao iniciar
  await checkAndUpdateTours();

  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📄 Acesse: http://localhost:${PORT}/index.html`);
    console.log(`🔄 Remap: http://localhost:${PORT}/api/remap`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status\n`);
  });
}

// Inicia o servidor
startServer();
