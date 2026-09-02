# @vianneytraina/ui

Composants React accessibles et tokens de design extraits de TeamPlanificateur.

Importez la feuille de styles une seule fois dans le layout Astro, pas par îlot :

```js
import "@vianneytraina/ui/styles.css";
```

## Migrating Button off `variant`

`Button` used to mix meaning and look in a single `variant` prop (`default`, `ghost`, `outline`, `danger`). From 1.1.0, prefer `intent` (what the action means) and `emphasis` (how strongly it is drawn). `variant` still works in 1.x and logs a development warning. It is removed in 2.0.0.

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
