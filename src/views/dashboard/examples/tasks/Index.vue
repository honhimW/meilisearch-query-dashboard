<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable
} from '@tanstack/vue-table'
import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'

import { h, onMounted, ref } from 'vue'
import DropdownAction from './ColumnAction.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { valueUpdater } from '@/lib/utils'
import { Task, TaskStatus, type TaskTypes } from 'meilisearch'
import router from '@/router'
import { TasksQuery } from 'meilisearch/src/types'
import type { LocationQueryValue } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { formatDate } from 'date-fns'

interface ITableData extends Task {

}

const tagVariants: Record<string, string> = {
  succeeded: 'success',
  processing: 'warning',
  failed: 'destructive',
  enqueued: 'outline',
  canceled: 'danger'
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
      renderTable()
    })
})

const tasks = ref<ITableData[]>([])

const columns: ColumnDef<ITableData>[] = [
  {
    accessorKey: 'uid',
    header: () => h('b', {}, 'UID')
  },
  {
    accessorKey: 'indexUid',
    header: 'Index'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h('div', {
      class: 'max-w-[500px] truncate flex items-center'
    }, [
      h(Badge, {
        variant: (tagVariants[row.original.status] as any),
        class: 'mr-2'
      }, () => row.original.status)
    ])
  },
  {
    accessorKey: 'type',
    header: 'Type'
  },
  {
    accessorKey: 'finishedAt',
    header: 'Finished At',
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, formatDate(row.original.finishedAt, 'yyyy-MM-dd HH:mm:ss.SSS'))
  },
  {
    accessorKey: 'canceledBy',
    header: 'Canceled By',
    enableHiding: true
  },
  {
    accessorKey: 'details',
    header: 'Details',
    enableHiding: true,
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, JSON.stringify(row.original.details))
  },
  {
    accessorKey: 'error',
    header: 'Error',
    enableHiding: true,
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, JSON.stringify(row.original.error))
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    enableHiding: true
  },
  {
    accessorKey: 'startedAt',
    header: 'Started At',
    enableHiding: true,
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, formatDate(row.original.startedAt, 'yyyy-MM-dd HH:mm:ss.SSS'))
  },
  {
    accessorKey: 'enqueuedAt',
    header: 'Enqueued At',
    enableHiding: true,
    cell: ({ row }) => h('span', { class: 'max-w-[500px] truncate font-medium' }, formatDate(row.original.enqueuedAt, 'yyyy-MM-dd HH:mm:ss.SSS'))
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const task = row.original
      return h('div', { class: 'relative max-w-[100px] flex items-center' }, h(DropdownAction, {
        task: { uid: task.uid }
      }))
    }
  },
  {
    id: 'json',
    enableHiding: false,
    filterFn: (row, columnId, filterValue, addMeta) => {
      return JSON.stringify(row.original).includes(filterValue)
    },
    cell: () => {
      return h('span', { style: 'visibility: hidden' }, '')
    }
  },
]

const filterValue = ref<string>('')

const updateFilter = (value: string) => {
  filterValue.value = value
  table.value.getColumn('json')?.setFilterValue(value)
}

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({
  canceledBy: false,
  details: false,
  error: false,
  duration: false,
  startedAt: false,
  enqueuedAt: false,
  json: false,
})
const rowSelection = ref({})

const table = ref(useVueTable({
  data: tasks.value,
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get rowSelection() {
      return rowSelection.value
    }
  }
}))

const renderTable = () => {
  table.value = useVueTable({
    data: tasks.value,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    state: {
      get sorting() {
        return sorting.value
      },
      get columnFilters() {
        return columnFilters.value
      },
      get columnVisibility() {
        return columnVisibility.value
      },
      get rowSelection() {
        return rowSelection.value
      }
    }
  })
}

</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center py-4">
      <Input
        class="max-w-sm"
        placeholder="Filter ..."
        :model-value="filterValue"
        @update:model-value="updateFilter"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Columns
            <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :checked="column.getIsVisible()"
            @update:checked="(value) => {
              column.toggleVisibility(!!value)
            }"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                          :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </div>
      <div class="space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>