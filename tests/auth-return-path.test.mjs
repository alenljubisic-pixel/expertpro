import assert from 'node:assert/strict'
import { test } from 'node:test'
import { safeAuthReturnPath } from '../lib/auth/return-path.ts'

const listing = '/oglasi/53317fea-f471-4dee-b9b2-a682adcae813'

test('returns users to their listing or credit checkout', () => {
  assert.equal(safeAuthReturnPath(listing), listing)
  assert.equal(safeAuthReturnPath(`${listing}?source=email`), `${listing}?source=email`)
  assert.equal(safeAuthReturnPath('/krediti'), '/krediti')
})

test('does not accept external or unrecognized redirect targets', () => {
  for (const value of [null, '', '//evil.example', '/\\evil.example', 'javascript:alert(1)', 'https://evil.example', '/auth/callback', '/admin']) {
    assert.equal(safeAuthReturnPath(value), '/dashboard')
  }
})
