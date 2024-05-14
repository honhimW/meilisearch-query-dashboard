<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { MeiliSearchCommunicationError } from 'meilisearch/src/errors/meilisearch-communication-error'
import { TaskStatus } from 'meilisearch'

const props = defineProps<{
  task: {
    uid: number
  }
}>()

function copy(id: string) {
  navigator.clipboard.writeText(id)
}

const cancelTask = () => {
  window.msClient.cancelTasks({
    uids: [props.task.uid]
  })
}

const deleteTask = () => {
  window.msClient.deleteTasks({
    uids: [props.task.uid]
  })
}

const waitForTask = () => {
  window.msClient.waitForTask(props.task.uid, {
    intervalMs: 500,
    timeOutMs: 60_000,
  })
    .then(value => {
      let done = (value.status == TaskStatus.TASK_SUCCEEDED)

      useToast().toast({
        class: cn(
          'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
        ),
        variant: done ? 'default' : 'destructive',
        title: `${value.type}: ${value.uid}`,
        description: value.status,
        duration: 4000,
      })
    })
    .catch(reason => {
      let error = reason as MeiliSearchCommunicationError
      useToast().toast({
        class: cn(
          'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
        ),
        variant: 'destructive',
        title: `${error.code}`,
        description: error.message,
        duration: 4000,
      })
    })
}

</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-8 w-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem @click="cancelTask">
        Cancel
      </DropdownMenuItem>
      <DropdownMenuItem @click="deleteTask">
        Delete
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="waitForTask">
        Await
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
