<script setup lang="ts">
import { type ColumnDef, DataTable } from '@/components/ui/data-table'
import data from '@/assets/tasks.json'
import { h, onMounted, ref } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableHeader from '@/components/ui/data-table/DataTableHeader.vue'
import type { Column } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import type { EnqueuedTaskObject } from 'meilisearch/src/types/types'
import { Task, TaskStatus, type TaskTypes } from 'meilisearch'
import { TasksQuery } from 'meilisearch/src/types'
import router from '@/router'
import type { LocationQueryValue } from 'vue-router'
import { formatDate } from 'date-fns'

interface ITableData extends Task {

}

const tagVariants: Record<string, string> = {
  succeeded: 'success',
  processing: 'warning',
  failed: 'destructive',
  enqueued: 'outline',
  canceled: 'danger',
}


onMounted(() => {
  let query = router.currentRoute.value.query
  let taskQuery: TasksQuery = {}
  if (query['indexUids']) {
    taskQuery.indexUids = query['indexUids'] as string[]
  }
  if (query['uids']) {
    let queryElement = query['uids']
    if (typeof queryElement == 'string') {
      taskQuery.uids = [Number(queryElement as string)]
    } else {
      taskQuery.uids = (queryElement as LocationQueryValue[]).map(value => Number(value))
    }
  }
  if (query['type']) {
    taskQuery.types = query['type'] as TaskTypes[]
  }
  if (query['status']) {
    taskQuery.statuses = query['status'] as TaskStatus[]
  }
  if (query['canceledBy']) {
    let queryElement = query['canceledBy']
    if (typeof queryElement == 'string') {
      taskQuery.canceledBy = [Number(queryElement as string)]
    } else {
      taskQuery.canceledBy = (queryElement as LocationQueryValue[]).map(value => Number(value))
    }
  }
  if (query['beforeEnqueuedAt']) {
    let beforeEnqueuedAt = Date.parse(query['beforeEnqueuedAt'] as string)
    if (beforeEnqueuedAt) {
      taskQuery.beforeEnqueuedAt = new Date(beforeEnqueuedAt)
    }
  }
  if (query['afterEnqueuedAt']) {
    let afterEnqueuedAt = Date.parse(query['afterEnqueuedAt'] as string)
    if (afterEnqueuedAt) {
      taskQuery.afterEnqueuedAt = new Date(afterEnqueuedAt)
    }
  }
  if (query['beforeStartedAt']) {
    let beforeStartedAt = Date.parse(query['beforeStartedAt'] as string)
    if (beforeStartedAt) {
      taskQuery.beforeStartedAt = new Date(beforeStartedAt)
    }
  }
  if (query['afterStartedAt']) {
    let afterStartedAt = Date.parse(query['afterStartedAt'] as string)
    if (afterStartedAt) {
      taskQuery.afterStartedAt = new Date(afterStartedAt)
    }
  }
  if (query['beforeFinishedAt']) {
    let beforeFinishedAt = Date.parse(query['beforeFinishedAt'] as string)
    if (beforeFinishedAt) {
      taskQuery.beforeFinishedAt = new Date(beforeFinishedAt)
    }
  }
  if (query['afterFinishedAt']) {
    let afterFinishedAt = Date.parse(query['afterFinishedAt'] as string)
    if (afterFinishedAt) {
      taskQuery.afterFinishedAt = new Date(afterFinishedAt)
    }
  }
  if (query['limit']) {
    let queryElement = query['limit']
    if (typeof queryElement == 'string') {
      taskQuery.limit = Number(queryElement as string)
    }
  }
  if (query['from']) {
    let queryElement = query['from']
    if (typeof queryElement == 'string') {
      taskQuery.from = Number(queryElement as string)
    }
  }
  console.log(taskQuery)
  window.msClient.getTasks(taskQuery)
    .then(value => {
      let _tasks: ITableData[] = []
      value.results.forEach(value1 => {
        let data = { ...value1 }
        _tasks.push(data)
      })
      tasks.value = _tasks
    })
})

const tasks = ref<ITableData[]>([]);

const columns: ColumnDef<ITableData>[] = [
  {
    accessorKey: 'uid',
    header: 'UID',
  },
  {
    accessorKey: 'indexUid',
    header: 'Index',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h('div', {
      class: 'max-w-[500px] truncate flex items-center',
    }, [
      h(Badge, {
        variant: (tagVariants[row.original.status] as any),
        class: 'mr-2',
      }, () => row.original.status),
    ])
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'finishedAt',
    header: 'Finished At',
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, formatDate(row.original.finishedAt, 'yyyy-MM-dd HH:mm:ss.SSS'))
  },
  {
    id: 'actions',
  },
];
</script>

<template>
  <div>
    <page-header title="Tasks"></page-header>
    <DataTable :columns="columns" :data="tasks"></DataTable>
  </div>
</template>
