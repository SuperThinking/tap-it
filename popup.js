document.addEventListener("DOMContentLoaded", () => {
  const mappingsListDiv = document.getElementById("mappings-list");
  const exportButton = document.getElementById("export-button");
  const importFileElement = document.getElementById("import-file");
  const importStatus = document.getElementById("import-status");

  const importExportButtonContainer = exportButton.parentElement;

  const importConfirmArea = document.createElement("div");
  importConfirmArea.id = "import-confirm-area";
  importConfirmArea.className = "hidden mt-2 space-y-2";
  importStatus.parentNode.insertBefore(
    importConfirmArea,
    importStatus.nextSibling,
  );

  let allMappings = {};

  function renderMappings() {
    mappingsListDiv.innerHTML = "";
    exportButton.disabled = true;

    const hostnames = Object.keys(allMappings).sort();

    if (hostnames.length === 0) {
      mappingsListDiv.innerHTML =
        '<p class="text-gray-500 text-center py-4">No mappings saved yet. Right-click on an element on any webpage and select "Tap-It: Map Element" to start.</p>';
      return;
    }

    hostnames.forEach((hostname) => {
      const mappings = allMappings[hostname] || [];
      if (mappings.length === 0) return;

      const hostDiv = document.createElement("div");
      hostDiv.className =
        "bg-white p-3 rounded-lg shadow border border-gray-200";

      const headerDiv = document.createElement("div");
      headerDiv.className =
        "flex items-center justify-between mb-2 pb-2 border-b border-gray-100";

      const titleDiv = document.createElement("div");
      titleDiv.className = "flex items-center gap-3";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className =
        "hostname-checkbox form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0 focus:ring-2";
      checkbox.dataset.hostname = hostname;
      checkbox.addEventListener("change", () => {
        exportButton.disabled = !document.querySelector(
          ".hostname-checkbox:checked",
        );
      });

      const title = document.createElement("h3");
      title.textContent = hostname;
      title.className = "font-semibold text-gray-700 text-lg";

      titleDiv.appendChild(checkbox);
      titleDiv.appendChild(title);
      headerDiv.appendChild(titleDiv);

      const deleteHostArea = document.createElement("div");
      deleteHostArea.className = "flex items-center gap-1";

      const deleteHostButton = document.createElement("button");
      deleteHostButton.textContent = "Delete All";
      deleteHostButton.className =
        "delete-host-btn text-red-500 hover:text-red-700 hover:bg-red-100 text-xs font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1";
      deleteHostButton.title = `Delete all mappings for ${hostname}`;

      const confirmHostDeleteSpan = document.createElement("span");
      confirmHostDeleteSpan.className =
        "confirm-host-delete hidden items-center gap-1 text-xs";
      confirmHostDeleteSpan.innerHTML = `
                <span class="text-red-600 font-medium">Confirm?</span>
                <button class="confirm-yes-btn text-green-600 hover:text-green-800 font-bold px-1 py-0 rounded hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-300" title="Yes, delete all">✔</button>
                <button class="confirm-no-btn text-red-600 hover:text-red-800 font-bold px-1 py-0 rounded hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-300" title="No, cancel">✖</button>
            `;

      deleteHostArea.appendChild(deleteHostButton);
      deleteHostArea.appendChild(confirmHostDeleteSpan);
      headerDiv.appendChild(deleteHostArea);

      deleteHostButton.addEventListener("click", () => {
        deleteHostButton.classList.add("hidden");
        confirmHostDeleteSpan.classList.remove("hidden");
        confirmHostDeleteSpan.classList.add("flex");
      });

      confirmHostDeleteSpan
        .querySelector(".confirm-yes-btn")
        .addEventListener("click", async () => {
          console.log(`Confirmed deletion for hostname: ${hostname}`);
          await deleteHostnameMappings(hostname);
          loadMappings();
        });

      confirmHostDeleteSpan
        .querySelector(".confirm-no-btn")
        .addEventListener("click", () => {
          confirmHostDeleteSpan.classList.add("hidden");
          confirmHostDeleteSpan.classList.remove("flex");
          deleteHostButton.classList.remove("hidden");
          console.log("Deletion cancelled by user for hostname:", hostname);
        });

      hostDiv.appendChild(headerDiv);

      const itemsContainer = document.createElement("div");
      itemsContainer.className = "space-y-2";

      mappings.forEach((mapping, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className =
          "flex items-center gap-3 p-2 border rounded-md border-gray-100 hover:bg-gray-50";

        const keyDiv = document.createElement("div");
        keyDiv.className =
          "font-bold font-mono text-center bg-gray-100 px-3 py-1 rounded text-gray-700 w-16";
        keyDiv.textContent = mapping.key;
        itemDiv.appendChild(keyDiv);

        const contentDiv = document.createElement("div");
        contentDiv.className = "flex-grow";

        const labelContainer = document.createElement("div");
        labelContainer.className = "mb-1";
        renderLabel(labelContainer, hostname, index, mapping.label || "");
        contentDiv.appendChild(labelContainer);

        const details = document.createElement("details");
        details.className = "text-xs";
        const summary = document.createElement("summary");
        summary.className = "text-gray-500 hover:text-gray-700 cursor-pointer";
        summary.textContent = "Show Selector";
        const selectorContent = document.createElement("div");
        selectorContent.className = "selector-content";
        selectorContent.textContent = mapping.selector;
        details.appendChild(summary);
        details.appendChild(selectorContent);
        contentDiv.appendChild(details);
        itemDiv.appendChild(contentDiv);

        const actionDiv = document.createElement("div");
        actionDiv.className = "flex-shrink-0";
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "&times;";
        deleteButton.className =
          "text-red-500 hover:text-red-700 font-bold text-xl px-2 py-0 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1";
        deleteButton.title = `Delete mapping for key "${mapping.key}"`;
        deleteButton.addEventListener("click", async () => {
          await deleteSingleMapping(hostname, index);
          loadMappings();
        });
        actionDiv.appendChild(deleteButton);
        itemDiv.appendChild(actionDiv);
        itemsContainer.appendChild(itemDiv);
      });
      hostDiv.appendChild(itemsContainer);
      mappingsListDiv.appendChild(hostDiv);
    });
  }

  function renderLabel(cell, hostname, mappingIndex, currentLabel) {
    cell.innerHTML = "";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = currentLabel || "[Click to add label]";
    labelSpan.className = "editable-label text-gray-800 text-sm";
    if (!currentLabel) {
      labelSpan.classList.add("text-gray-400", "italic");
    }
    labelSpan.title = "Click to edit label";

    labelSpan.addEventListener("click", () => {
      renderLabelInput(cell, hostname, mappingIndex, currentLabel);
    });

    cell.appendChild(labelSpan);
  }

  function renderLabelInput(cell, hostname, mappingIndex, currentLabel) {
    cell.innerHTML = "";
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentLabel;
    input.className = "label-input w-full text-sm";
    input.placeholder = "Enter description...";

    input.addEventListener("blur", async () => {
      const newLabel = input.value.trim();
      await saveLabel(hostname, mappingIndex, newLabel);
      renderLabel(cell, hostname, mappingIndex, newLabel);
    });

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        input.blur();
      } else if (e.key === "Escape") {
        renderLabel(cell, hostname, mappingIndex, currentLabel);
      }
    });

    cell.appendChild(input);
    input.focus();
    input.select();
  }

  async function loadMappings() {
    resetImportUI();
    try {
      const result = await chrome.storage.sync.get(null);
      allMappings = result || {};
      console.log("Loaded mappings:", allMappings);
      renderMappings();
    } catch (error) {
      console.error("Error loading mappings:", error);
      mappingsListDiv.innerHTML =
        '<p class="text-red-500 text-center py-4">Error loading mappings. See console.</p>';
    }
  }

  async function saveLabel(hostname, mappingIndex, newLabel) {
    if (!allMappings[hostname]?.[mappingIndex]) {
      console.error("Error saving label: Mapping not found.");
      return;
    }
    allMappings[hostname][mappingIndex].label = newLabel;
    try {
      await chrome.storage.sync.set({ [hostname]: allMappings[hostname] });
      console.log(`Label updated for ${hostname}, index ${mappingIndex}`);
    } catch (error) {
      console.error("Error saving label to storage:", error);
      alert("Failed to save label. See console.");
      loadMappings();
    }
  }

  async function deleteSingleMapping(hostname, mappingIndex) {
    if (!allMappings[hostname]?.[mappingIndex]) {
      console.error("Error deleting mapping: Mapping not found.");
      return;
    }
    const deletedMapping = allMappings[hostname].splice(mappingIndex, 1);
    console.log("Attempting to delete single mapping:", deletedMapping);
    try {
      if (allMappings[hostname].length === 0) {
        await chrome.storage.sync.remove(hostname);
        delete allMappings[hostname];
        console.log(`Removed all mappings and hostname key for ${hostname}`);
      } else {
        await chrome.storage.sync.set({ [hostname]: allMappings[hostname] });
        console.log(`Deleted mapping index ${mappingIndex} for ${hostname}`);
      }
    } catch (error) {
      console.error("Error deleting mapping from storage:", error);
      alert("Failed to delete mapping. See console.");
      loadMappings();
    }
  }

  async function deleteHostnameMappings(hostname) {
    if (!allMappings[hostname]) {
      console.warn("Attempted to delete non-existent hostname:", hostname);
      return;
    }
    try {
      await chrome.storage.sync.remove(hostname);
      delete allMappings[hostname];
      console.log(`Deleted all mappings for hostname: ${hostname}`);
    } catch (error) {
      console.error(`Error deleting hostname ${hostname} from storage:`, error);
      alert(`Failed to delete mappings for ${hostname}. See console.`);
      loadMappings();
    }
  }

  function resetImportUI(message = "", messageClass = "text-gray-600") {
    importStatus.textContent = message;
    importStatus.className = `text-sm mt-2 h-4 ${messageClass}`;
    importConfirmArea.innerHTML = "";
    importConfirmArea.classList.add("hidden");
    importExportButtonContainer.classList.remove("hidden");
    importFileElement.value = "";
  }

  exportButton.addEventListener("click", () => {
    const selectedHostnames = Array.from(
      document.querySelectorAll(".hostname-checkbox:checked"),
    ).map((cb) => cb.dataset.hostname);
    if (selectedHostnames.length === 0) {
      alert("Please select at least one hostname to export.");
      return;
    }
    const dataToExport = {};
    selectedHostnames.forEach((hostname) => {
      if (allMappings[hostname]) {
        dataToExport[hostname] = allMappings[hostname].map((m) => ({
          key: m.key,
          selector: m.selector,
          label: m.label || "",
        }));
      }
    });
    if (Object.keys(dataToExport).length === 0) {
      alert("No mappings found for the selected hostnames.");
      return;
    }
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `tap-it-mappings-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Exported mappings for:", selectedHostnames);
    resetImportUI();
  });

  importFileElement.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    resetImportUI(`Reading ${file.name}...`, "text-blue-600");

    const reader = new FileReader();

    reader.onload = async (e) => {
      let importedData;
      try {
        importedData = JSON.parse(e.target.result);
        console.log("Parsed imported data:", importedData);

        if (
          typeof importedData !== "object" ||
          importedData === null ||
          Array.isArray(importedData)
        ) {
          throw new Error("Invalid file format. Expected JSON object.");
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        resetImportUI(`Import failed: ${error.message}`, "text-red-600");
        return;
      }

      let importedCount = 0,
        hostnamesAffected = [],
        skippedHostnames = [];
      const dataToStore = {};
      for (const hostname in importedData) {
        if (Object.hasOwnProperty.call(importedData, hostname)) {
          const mappings = importedData[hostname];
          if (
            !Array.isArray(mappings) ||
            !mappings.every(
              (m) =>
                typeof m.key === "string" && typeof m.selector === "string",
            )
          ) {
            console.warn(`Skipping invalid data for hostname: ${hostname}`);
            skippedHostnames.push(hostname);
            continue;
          }
          const sanitizedMappings = mappings.map((m) => ({
            key: m.key,
            selector: m.selector,
            label: typeof m.label === "string" ? m.label : "",
          }));
          dataToStore[hostname] = sanitizedMappings;
          importedCount += sanitizedMappings.length;
          hostnamesAffected.push(hostname);
        }
      }

      if (Object.keys(dataToStore).length === 0) {
        let errorMsg = "Import failed: No valid mappings found";
        if (skippedHostnames.length > 0) {
          errorMsg += `. Skipped invalid data for ${skippedHostnames.length} site(s).`;
        }
        resetImportUI(errorMsg, "text-red-600");
        return;
      }

      const hostnamesToOverwrite = hostnamesAffected.filter(
        (h) => allMappings[h] && allMappings[h].length > 0,
      );

      if (hostnamesToOverwrite.length > 0) {
        importStatus.textContent = `Importing will overwrite existing mappings for ${hostnamesToOverwrite.length} site(s):`;
        importStatus.className = "text-sm mt-2 text-orange-600 font-semibold";

        importConfirmArea.innerHTML = `
                    <ul class="list-disc list-inside text-xs text-orange-700 ml-4 max-h-20 overflow-y-auto border p-1 rounded">
                        ${hostnamesToOverwrite.map((h) => `<li>${h}</li>`).join("")}
                    </ul>
                    <div class="flex gap-3 justify-center mt-2">
                        <button id="confirm-import-overwrite" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-150">
                            Confirm Overwrite
                        </button>
                        <button id="cancel-import" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm transition duration-150">
                            Cancel Import
                        </button>
                    </div>
                `;
        importConfirmArea.classList.remove("hidden");
        importExportButtonContainer.classList.add("hidden");

        document
          .getElementById("confirm-import-overwrite")
          .addEventListener("click", async () => {
            await proceedWithImport(
              dataToStore,
              importedCount,
              hostnamesAffected,
              skippedHostnames,
              hostnamesToOverwrite.length,
            );
          });

        document
          .getElementById("cancel-import")
          .addEventListener("click", () => {
            console.log("Import cancelled by user via UI.");
            resetImportUI("Import cancelled.", "text-orange-600");
          });
      } else {
        await proceedWithImport(
          dataToStore,
          importedCount,
          hostnamesAffected,
          skippedHostnames,
          0,
        );
      }
    };

    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      resetImportUI(`Error reading file: ${reader.error}`, "text-red-600");
    };

    reader.readAsText(file);
  });

  async function proceedWithImport(
    dataToStore,
    importedCount,
    hostnamesAffected,
    skippedHostnames,
    overwriteCount,
  ) {
    try {
      await chrome.storage.sync.set(dataToStore);
      console.log("Successfully imported mappings for:", hostnamesAffected);

      let successMsg = `Imported ${importedCount} mappings for ${hostnamesAffected.length} site(s).`;
      if (overwriteCount > 0) successMsg += ` (Overwrote ${overwriteCount})`;
      if (skippedHostnames.length > 0)
        successMsg += ` (Skipped ${skippedHostnames.length})`;

      resetImportUI(successMsg, "text-green-600");
      loadMappings();
    } catch (error) {
      console.error("Error saving imported data:", error);
      resetImportUI(
        `Import failed during save: ${error.message}`,
        "text-red-600",
      );
    }
  }

  loadMappings();
});
