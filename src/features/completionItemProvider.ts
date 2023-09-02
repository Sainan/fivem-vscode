import * as vscode from "vscode";
import { NativeFunction } from "../types/nativeFunction";

export class CompletionItemProvider implements vscode.CompletionItemProvider {
	private natives: { name: string; completionItem: vscode.CompletionItem }[] = [];
	private previousResult: { name: string; completionItem: vscode.CompletionItem }[] = [];
	private previousText: string = "";

	constructor(natives: NativeFunction[]) {
		for (const native of natives) {
			this.addNative(native);
		}
	}

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const wordRange = document.getWordRangeAtPosition(new vscode.Position(position.line, position.character - 1));
		if (!wordRange) return;

		const text = document.getText(wordRange).toLowerCase();
		const natives = text.startsWith(this.previousText) ? this.previousResult : this.natives;
		const result = natives.filter((n) => n.name.indexOf(text) != -1);

		this.previousText = text;
		this.previousResult = result;

		return result.map((n) => n.completionItem);
	}

	private addNative(native: NativeFunction) {
		const completionItem = new vscode.CompletionItem(native.name, vscode.CompletionItemKind.Function);

		completionItem.documentation = new vscode.MarkdownString();

		const params = native.params.map((p) => `${p.name}: ${p.type}`).join(", ");
		completionItem.documentation.appendCodeblock(
			`${native.name}(${params})${native.return_type && `: ${native.return_type}`}`
		);

		if (native.description) {
			completionItem.documentation.appendMarkdown(`  \n\n${native.description}`);
		}

		this.natives.push({ name: native.name.toLowerCase(), completionItem });
	}
}
