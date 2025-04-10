
import { useDispatch, useSelector} from 'react-redux'
import { AppDispatch } from '../utils/store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<any>()