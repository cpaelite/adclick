package path

func DBGetAvailablePaths() []PathConfig {
	return nil
}

func DBGetUserPaths(userId int64) []PathConfig {
	return nil
}

func DBGetPath(pathId int64) (c PathConfig) {
	return
}

func DBGetPathLanders(pathId int64) (landers []PathLander) {
	return
}

func DBGetPathOffers(pathId int64) (offers []PathOffer) {
	return
}
