# Auto Refactor

This tool refactors your code automatically by using OpenAI API.

## Usage

Creaet instruction file. ex) `instruction.yaml`

```yaml
- targetFileGlob: src/**/*.tsx
  filterFunction: |-
    (filePath, content) => {
      // only match Japanese characters
      return content.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/);
    }
  instruction: |
    Wrap the text with `<Text>` component.
    DO NOT wrap the text wrapped with `<Button>` component.
- targetFileGlob: src/**/*.md
  instruction: |
    H1 header must be only one.
    Rpelace other H1 headers with H2 headers.
```

Get OpenAI API key and set it to environment variable.
Then run this tool.

```console
export OPENAI_API_KEY=your_api_key
deno run --allow-env --allow-read --allow-write --allow-net https://deno.land/x/auto_refactor/main.ts ./instruction.yaml
```

> [!WARNING]
> This tool overwrites your files. Please use version control system
> and backup your files before running this tool.
