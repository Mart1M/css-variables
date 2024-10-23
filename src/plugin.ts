penpot.ui.open("CSS Color Variables", `?theme=${penpot.theme}`, {
  width: 300,
  height: 400
});

penpot.ui.onMessage((message) => {
  if (message === "get-colors") {
    const colors = penpot.library.local.colors;
    const cssVariables = colors.map(color => {
      const name = color.name.replace(/\s+/g, '-').toLowerCase();
      const value = color.color || 'transparent';
      return `--${name}: ${value};`;
    });
    penpot.ui.sendMessage({
      type: "colors",
      cssVariables
    });
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
