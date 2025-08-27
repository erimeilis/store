import { storeViewByName } from './renderer'

// Import view components
import Home from './view/Home'
import Login from './view/Login'
import Dashboard from './view/Dashboard'
import Items from './view/Items'

export default function initView() {
  // Register views in the view registry
  storeViewByName('home', Home)
  storeViewByName('login', Login)
  storeViewByName('dashboard', Dashboard)
  storeViewByName('items', Items)
}
