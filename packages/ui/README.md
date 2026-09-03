# @vianneytraina/ui

Composants React accessibles et tokens de design extraits de TeamPlanificateur.

Le build utilise tsup (ESM, CSS frère). Vite library mode est l’alternative identifiée si la maintenance de tsup bloque (ADR-0011).

Importez la feuille de styles une seule fois dans le layout Astro, pas par îlot :

```js
import "@vianneytraina/ui/styles.css";
```

## Migrating Button off `variant`

`Button` used to mix meaning and look in a single `variant` prop (`default`, `ghost`, `outline`, `danger`). From 2.0.0, use `intent` (what the action means) and `emphasis` (how strongly it is drawn). `variant` was removed.

| `variant` (v1) | `intent` | `emphasis` |
| --- | --- | --- |
| `default` | `neutral` | `filled` |
| `ghost` | `neutral` | `ghost` |
| `outline` | `neutral` | `outline` |
| `danger` | `danger` | `filled` |

```jsx
// Before
<Button variant="outline">Annuler</Button>
<Button variant="danger">Supprimer</Button>

// After
<Button intent="neutral" emphasis="outline">Annuler</Button>
<Button intent="danger" emphasis="filled">Supprimer</Button>
```
