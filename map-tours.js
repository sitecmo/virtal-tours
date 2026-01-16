const fs = require("fs").promises;
const path = require("path");

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

async function mapTours() {
  const srcPath = path.join(__dirname, "src");
  const toursMap = {};

  try {
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

    // Salva o objeto em um arquivo JSON
    const outputJson = JSON.stringify(toursMap, null, 2);
    await fs.writeFile("tours-map.json", outputJson);
    console.log("✓ tours-map.json criado com sucesso!");

    // Salva o objeto em um arquivo JS
    const outputJs = `const toursData = ${JSON.stringify(
      toursMap,
      null,
      2
    )};\n`;
    await fs.writeFile("tours-data.js", outputJs);
    console.log("✓ tours-data.js criado com sucesso!");

    // Exibe resumo
    const totalProjects = Object.keys(toursMap).length;
    const totalTours = Object.values(toursMap).reduce(
      (sum, tours) => sum + tours.length,
      0
    );
    console.log(`\nTotal de projetos: ${totalProjects}`);
    console.log(`Total de tours: ${totalTours}`);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

// Executa o script
mapTours();
