<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/app'
import { ref, watch } from 'vue'

const store = useAppStore()

const serverUrl = ref<string | undefined>(undefined)
const apiKey = ref<string | undefined>(undefined)

const save = () => {
  checkUrl()
  if (!isValid.value) {
    throw new Error()
  }
  store.setServerUrl(serverUrl.value)
  store.setApiKey(apiKey.value)
  store.buildClient()
}

const saveAndClose = () => {
  try {
    save()
    store.toggleDialog(false)
  } catch (_) {
  }
}

watch(() => store.showDialog, async (show: boolean) => {
  if (show) {
    doLoadProfile()
  }
})

watch(() => serverUrl.value, async (input: string | undefined) => {
  checkUrl()
})

const doLoadProfile = () => {
  serverUrl.value = store.serverUrl
  apiKey.value = store.apiKey
}

const isValid = ref(true)

const checkUrl = () => {
  let value = serverUrl.value
  if (value !== undefined) {
    try {
      new URL(value)
      isValid.value = true
    } catch (_) {
      isValid.value = false
    }
  }
}

</script>

<template>
  <Dialog v-model:open="store.showDialog" @keydown.esc.prevent="store.toggleDialog(false)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader class="text-left">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Setup Meili-Search Client.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="url" class="text-right">
            URL
          </Label>
          <Input id="url" placeholder="http://localhost:7700" v-model="serverUrl" class="col-span-3"
                 @keydown.enter.prevent="saveAndClose"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="apiKey" class="text-right">
            API KEY
          </Label>
          <Input v-model="apiKey" class="col-span-3" @keydown.enter.prevent="saveAndClose" />
        </div>
      </div>
      <DialogFooter class="flex flex-row justify-between items-center gap-4">
        <div class="flex gap-4" style="color: #e00b0b">
          <div v-if="!isValid">
            <Icon name="TriangleAlert" />
            <span>
              Invalid URL!
            </span>
          </div>
        </div>
        <div class="flex gap-4">
          <Button type="submit" @click="saveAndClose" variant="default">
            OK
          </Button>
          <Button type="submit" @click="save" variant="destructive">
            Apply
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>