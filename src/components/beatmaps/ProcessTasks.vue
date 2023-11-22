<script lang="ts">
import { BeatmapMode } from '@interfaces/beatmap/beatmap';
import { Task, TaskName, TaskStatus } from '@interfaces/beatmap/task';
import { defineComponent, h, PropType, VNode, VNodeArrayChildren } from 'vue';

interface PossibleTask {
    name: string;
    short: string;
    locked: boolean;
    status: TaskStatus[];
}

interface Mode {
    name: string;
    short: string;
    count: number;
    status: TaskStatus;
}

function taskNode(text: string | VNodeArrayChildren, status: TaskStatus | 'blocked' | 'open' | 'secondary', tooltip?: string): VNode {
    const data: Record<string, any> = {
        class: [
            'px-1',
            'text-' + status.toLowerCase(),
        ],
    };

    if (tooltip) {
        data['data-bs-toggle'] = 'tooltip';
        data['data-bs-placement'] = 'top';
        data.title = tooltip;
    }

    return h('span', data, text);
}

export default defineComponent({
    props: {
        tasks: {
            type: Array as PropType<Task[]>,
            required: true,
        },
        tasksLocked: {
            type: Array as PropType<TaskName[]>,
            required: true,
        },
        mode: {
            type: String as PropType<BeatmapMode>,
            required: true,
        },
    },
    render () {
        const possibleTasks: PossibleTask[] = [
            //{ name: 'Storyboard', short: 'SB', locked: false, status: [] },
            //{ name: 'Hitsounds', short: 'HS', locked: false, status: [] },
            { name: 'Easy', short: 'E', locked: false, status: [] },
            { name: 'Normal', short: 'N', locked: false, status: [] },
            { name: 'Hard', short: 'H', locked: false, status: [] },
            { name: 'Insane', short: 'I', locked: false, status: [] },
            { name: 'Expert', short: 'X', locked: false, status: [] },
        ];

        const modes: Mode[] = [
            { name: 'osu', short: 'circle', count: 0, status: TaskStatus.Done },
            { name: 'taiko', short: 'drum', count: 0, status: TaskStatus.Done },
            { name: 'catch', short: 'apple-alt', count: 0, status: TaskStatus.Done },
            { name: 'mania', short: 'stream', count: 0, status: TaskStatus.Done },
        ];

        const nodes: VNode[] = [];
        const overflowTasks = this.tasks.length >= 10;
        const isHybrid = this.mode === BeatmapMode.Hybrid;

        for (const possibleTask of possibleTasks) {
            let isClaimed = false;
            const isLocked = this.tasksLocked.includes(possibleTask.name as TaskName);

            for (const task of this.tasks) {
                if (possibleTask.name === task.name) {
                    possibleTask.status.push(task.status);
                    isClaimed = true;

                    const i = modes.findIndex(m => m.name === task.mode);

                    if (i !== -1) {
                        modes[i].count++;
                        if (task.status === TaskStatus.WIP) modes[i].status = TaskStatus.WIP;
                    }
                }
            }

            if (isHybrid) continue;

            if (overflowTasks && possibleTask.status.length > 1) {
                nodes.push(taskNode(possibleTask.short + '+', 'secondary', possibleTask.status.length.toString()));
            } else {
                for (const status of possibleTask.status) {
                    nodes.push(taskNode(possibleTask.short, status));
                }
            }

            if (!isClaimed) {
                nodes.push(taskNode(possibleTask.short, isLocked ? 'blocked' : 'open'));
            }
        }

        if (isHybrid) {
            for (const mode of modes) {
                nodes.push(
                    taskNode(
                        [
                            h('i', {
                                class: [
                                    'fas',
                                    'fa-' + mode.short,
                                ],
                            }),
                        ],
                        mode.count ? mode.status : 'blocked',
                        mode.count.toString()
                    )
                );
            }
        }

        return h('span', {
            class: 'fw-bold',
        }, nodes);
    },
});
</script>
