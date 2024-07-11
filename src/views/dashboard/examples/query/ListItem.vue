<script lang="ts" setup>
import { computed, defineComponent } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { Attribute, ScreenProps } from '@/views/dashboard/examples/query/Screen.vue'
import router from '@/router'

const props = defineProps<{
  row: Record<string, any>
  attributes?: ScreenProps
}>()

const flatted = computed(() => {
  let selected = props.attributes?.selected ?? []
  let unselected = props.attributes?.unselected ?? []
  let _flattenObject = flattenObject(props.row)
  let map = new Map<string, any>()
  if (selected.length > 0) {
    let selectedKeys = selected.map(_a => _a.title)
    for (let i = 0; i < selectedKeys.length; i++) {
      let key = selectedKeys[i]
      map.set(key, 'undefined')
      for (let flattenObjectKey in _flattenObject) {
        if (flattenObjectKey.startsWith(key)) {
          let flattenObjectElement = _flattenObject[flattenObjectKey]
          if (flattenObjectElement) {
            map.set(key, flattenObjectElement)
            break
          }
        }
      }
    }
  } else {
    let unSelectedKeys = unselected.map(_a => _a.title)
    for (let i = 0; i < unSelectedKeys.length; i++) {
      let key = unSelectedKeys[i]
      let flattenObjectElement = _flattenObject[key]
      if (flattenObjectElement) {
        map.set(key, flattenObjectElement)
      }
    }
  }
  return map
})

const flattenObject = (obj: any, parentKey = '', result = {} as Record<string, any>) => {
  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}.${key}` : `${key}`
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], newKey, result)
    } else {
      result[newKey] = obj[key]
    }
  }
  return result
}
</script>

<template>
  <div class="flex max-h-[200px] items-center source dscTruncateByHeight">
    <template v-for="(value, index) of flatted" :key="index">
      <Badge
        v-show="flatted.size > 1"
        variant="secondary"
        class="mr-2"
        style="font-size: 0.85rem; font-weight: bold;"
      >
        {{ '/' + value[0].replace('.', '/') + ':' }}
      </Badge>
      <span class="font-medium" style="padding-right: 7px" v-html="value[1]"></span>
    </template>
  </div>
</template>

<style scoped>
.items-center {
  align-items: center;
}

.source {
  margin-bottom: 0;
  line-height: 2em;
  word-break: break-word;
}

.dscTruncateByHeight {
  overflow: hidden;
  display: inline-block;
  max-height: 115px;
}

span:hover {
  text-decoration: underline;
}
</style>
