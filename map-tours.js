const fs = require("fs").promises;
const path = require("path");

function formatProjectName(folderName) {
  return folderName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
    const projectFolders = await fs.readdir(srcPath, { withFileTypes: true });

    for (const folder of projectFolders) {
      if (folder.isDirectory()) {
        const projectPath = path.join(srcPath, folder.name);
        const projectName = formatProjectName(folder.name);
        toursMap[projectName] = [];

        const contents = await fs.readdir(projectPath, { withFileTypes: true });

        for (const item of contents) {
          if (item.isDirectory()) {
            const indexPath = path.join(projectPath, item.name, "index.html");
            try {
              await fs.access(indexPath);
              toursMap[projectName].push({
                name: formatTourName(projectName, item.name),
                href: `src/${folder.name}/${item.name}/index.html`,
              });
            } catch {}
          }
        }
        toursMap[projectName].sort((a, b) => a.name.localeCompare(b.name));
        if (toursMap[projectName].length === 0) {
          delete toursMap[projectName];
        }
      }
    }

    const outputJson = JSON.stringify(toursMap, null, 2);
    await fs.writeFile("tours-map.json", outputJson);
    console.log("✓ tours-map.json criado com sucesso!");

    const outputJs = `const toursData = ${JSON.stringify(
      toursMap,
      null,
      2
    )};\n`;
    await fs.writeFile("tours-data.js", outputJs);
    console.log("✓ tours-data.js criado com sucesso!");

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
