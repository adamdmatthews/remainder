export type Task = {
    id: number
    title: string
}

export type TaskWithDeadile = Task & {
    deadline: Date
}
