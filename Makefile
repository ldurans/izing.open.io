include .env

release:
	GITHUB_TOKEN=${GITHUB_TOKEN} npm run release 
