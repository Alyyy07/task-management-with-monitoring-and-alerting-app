import { TaskService } from "./tasks.service.js";

export function buildTaskController(taskService: TaskService) {
  return {
    async listTasks(request: any, reply: any) {
      const params = request.params as { orgId: string };
      const tasks = await taskService.listTasks(
        { userId: request.user.userId },
        params.orgId
      );
      return reply.status(200).send(tasks);
    },

    async createTask(request: any, reply: any) {
      const body = request.body as {
        title: string;
        description?: string;
        organizationId: string;
      };
        const newTask = await taskService.create(
          { userId: request.user.userId },
          body
        );
        return reply.status(201).send(newTask);
    },
    async updateTask(request: any, reply: any) {
      const params = request.params as { taskId: string };
      const body = request.body as { title?: string, description?: string };
      const updatedTask = await taskService.updateTask(
        { userId: request.user.userId },
        params.taskId,
        body
      );
      return reply.status(200).send(updatedTask);
    },

    async deleteTask(request: any, reply: any) {
      const params = request.params as { taskId: string };
      await taskService.deleteTask(
        { userId: request.user.userId },
        params.taskId
      );
      return reply.status(204).send();
    },
  };
}
