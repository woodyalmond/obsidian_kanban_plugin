import { App, Plugin, TFile } from 'obsidian';

export default class KanbanPlugin extends Plugin {
	async onload() {
		console.log('Kanban Plugin 로드됨');

		this.registerEvent(this.app.vault.on('modify', this.onModify.bind(this)));
	}

	async onModify(file: TFile) {
		if (file.extension !== 'md') return;

		const content = await this.app.vault.read(file);

		// 필요한 섹션이 있는지 확인
		if (
			!content.includes('## Not started') ||
			!content.includes('## In progress') ||
			!content.includes('## Done')
		) {
			return;
		}

		// 내용 분할
		let lines = content.split('\n');

		let tasks: { line: string; index: number }[] = [];
		let taskStatusChanged = false;

		// 각 라인 분석
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// 작업 감지
			if (line.trim().match(/^(- \[( |\/|x)\] .+)/)) {
				tasks.push({ line: lines[i], index: i });
			}
		}

		// 작업 처리
		for (let task of tasks) {
			let match = task.line.match(/^- \[( |\/|x)\] (.*)/);
			if (match) {
				let status = match[1];
				let taskText = match[2];

				// 원하는 섹션 결정
				let desiredSection = '';
				if (status === ' ') {
					desiredSection = 'Not started';
				} else if (status === '/') {
					desiredSection = 'In progress';
				} else if (status === 'x') {
					desiredSection = 'Done';
				}

				// 현재 작업의 섹션 확인
				let currentSection = this.getTaskSection(lines, task.index);
				if (currentSection !== desiredSection) {
					// 작업을 현재 위치에서 제거
					lines.splice(task.index, 1);

					// 작업 제거 후 인덱스 재조정
					for (let t of tasks) {
						if (t.index > task.index) {
							t.index--;
						}
					}

					// 원하는 섹션의 인덱스 찾기
					let insertIndex = this.findSectionInsertIndex(lines, desiredSection);

					if (insertIndex !== -1) {
						// 작업 삽입
						lines.splice(insertIndex, 0, task.line);
						taskStatusChanged = true;

						// 삽입 후 인덱스 재조정
						for (let t of tasks) {
							if (t.index >= insertIndex) {
								t.index++;
							}
						}
					} else {
						console.error(`섹션 '${desiredSection}'을 찾을 수 없습니다.`);
					}
				}
			}
		}

		// 변경 사항이 있으면 파일에 저장
		if (taskStatusChanged) {
			const newContent = lines.join('\n');
			await this.app.vault.modify(file, newContent);
		}
	}

	getTaskSection(lines: string[], index: number): string {
		// 현재 인덱스부터 위로 이동하며 섹션 찾기
		for (let i = index - 1; i >= 0; i--) {
			const line = lines[i].trim();
			if (line.startsWith('##')) {
				return line.replace('##', '').trim();
			}
		}
		return '';
	}

	findSectionInsertIndex(lines: string[], sectionName: string): number {
		// 섹션 헤더의 인덱스를 찾음
		let sectionIndex = lines.findIndex(
			(line) => line.trim() === '## ' + sectionName
		);

		if (sectionIndex === -1) {
			return -1;
		}

		let insertIndex = sectionIndex + 1;

		// 빈 줄을 건너뛰지 않고 섹션 헤더 바로 아래에 삽입
		// 빈 줄이 여러 개 있어도 첫 번째 빈 줄 다음에 삽입

		// 섹션 헤더 다음에 다른 작업이 있으면 그 위에 삽입
		while (
			insertIndex < lines.length &&
			lines[insertIndex].trim() !== '' &&
			!lines[insertIndex].trim().startsWith('##') &&
			!lines[insertIndex].trim().match(/^(- \[( |\/|x)\] .+)/)
		) {
			insertIndex++;
		}

		return insertIndex;
	}

	onunload() {
		console.log('Kanban Plugin 언로드됨');
	}
}
