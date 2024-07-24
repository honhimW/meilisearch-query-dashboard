<script lang="ts" setup>
import { computed, defineComponent, h } from 'vue'
import type { Attribute, ScreenProps } from '@/views/dashboard/examples/query/Screen.vue'
import { type ColumnDef, DataTable } from '@/components/ui/data-table'
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet'

const props = defineProps<{
  row: Record<string, any>
  attributes?: ScreenProps
}>()

const flatted = computed(() => {
  let _flattenObject = flattenObject(props.row)
  let iDatas: IData[] = []

  for (const flattenObjectKey in _flattenObject) {
    iDatas.push({
      key: flattenObjectKey,
      value: _flattenObject[flattenObjectKey]
    })
  }

  if (_flattenObject['_geo.lat'] && _flattenObject['_geo.lng']) {
    iDatas.push({
      key: '_geo',
      value: {
        lat: _flattenObject['_geo.lat'],
        lng: _flattenObject['_geo.lng'],
      }
    })
  }

  return iDatas
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

interface IData {
  key: string
  value: any
}

const InnerHTMLComponent = defineComponent({
  props: ['html', 'type'],
  render() {
    return h(this.type ?? 'div', { innerHTML: this.html })
  }
})

const resolveMedia = (raw: any) => {
  if (typeof raw == 'string' && raw.indexOf('</aishl-msq-t>') != -1) {
    return h(InnerHTMLComponent, {
      class: ' font-medium source',
      style: 'word-break: break-word; white-space: pre-wrap',
      type: 'pre',
      html: raw
    })
  }

  let imgRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|psd|bmp|tif)$/i
  let audioRegex = /^https:?\/\/.*\.(mp3|wav|wma|ogg|ape)$/i
  let videoRegex = /^https:?\/\/.*\.(mp4|avi|mkv|flv|wmv|mov)$/i
  let link = /^https:?\/\/.*/i

  let url = raw
  if (imgRegex.test(url)) {
    return h('img', { src: url, alt: 'Image', class: 'max-h-[240px]' })
  } else if (audioRegex.test(url)) {
    return h('audio', { controls: true, src: url })
  } else if (videoRegex.test(url)) {
    return h('video', { controls: true, src: url })
  } else if (link.test(url)) {
    return h('a', { href: url }, url)
  } else {
    return h(InnerHTMLComponent, {
      class: ' font-medium source',
      style: 'word-break: break-word; white-space: pre-wrap',
      type: 'pre',
      html: raw
    })
  }
}

const resolveGeo = (geo: {lat: number, lng: number}) => {
  return h('div', {
    style: 'height:200px; width:400px',
  }, [
    h(LMap, {
      class: 'flex items-center',
      zoom: 12,
      center: [geo.lat, geo.lng],
      useGlobalLeaflet: false,
      options: {
        attributionControl: false,
      }
    }, [
      h(LTileLayer, {
        'layer-type': 'base',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      }),
      h(LMarker, {
        latLng: [geo.lat, geo.lng]
      }),
    ])
  ])
}

const resolve = (original: any) => {
  if (original.key == '_geo') {
    return resolveGeo(original.value)
  } else {
    return resolveMedia(original.value)
  }
}

const columns: ColumnDef<IData>[] = [
  {
    accessorKey: 'key',
    header: () => h('b', {}, 'Key'),
    enableSorting: false,
    cell: ({ row }) => h('pre', { style: 'font-weight: bolder;' }, row.original.key)
  },
  {
    accessorKey: 'value',
    header: () => h('b', {}, 'Value'),
    cell: ({ row }) => h('div', {
      class: 'flex items-center',
      style: 'width: 100%; height: 100%'
    }, [
      resolve(row.original)
    ]),
    enableSorting: false
  }
]

</script>

<template>
  <div class="dscTruncateByHeight">
    <DataTable :columns="columns" :data="flatted" />
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
  overflow-y: scroll;
  overflow-x: clip;
  display: inline-block;
  height: 70vh;
}

span:hover {
  text-decoration: underline;
}
</style>
